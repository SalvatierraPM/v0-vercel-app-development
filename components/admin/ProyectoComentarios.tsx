"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Clock, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ProyectoComentariosProps {
  proyectoId: string
  usuarioActual: {
    id: string
    nombre: string
    email: string
  }
  readOnly?: boolean
}

interface Comentario {
  id: string
  proyecto_id: string
  usuario_id: string
  contenido: string
  menciones: string[] | null
  created_at: string
  updated_at: string
  usuario?: {
    id: string
    nombre: string
    email: string
  }
}

interface Usuario {
  id: string
  nombre: string
  email: string
}

export default function ProyectoComentarios({ proyectoId, usuarioActual, readOnly = false }: ProyectoComentariosProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [sugerenciasFiltradas, setSugerenciasFiltradas] = useState<Usuario[]>([])
  const [posicionCursor, setPosicionCursor] = useState(0)
  const [ultimoArroba, setUltimoArroba] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("proyecto_comentarios")
          .select(
            `
            *,
            usuario:usuario_id (
              id,
              nombre,
              email
            )
          `,
          )
          .eq("proyecto_id", proyectoId)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setComentarios(data || [])
      } catch (err) {
        console.error("Error al cargar comentarios:", err)
        setError("No se pudieron cargar los comentarios")
      } finally {
        setLoading(false)
      }
    }

    const fetchUsuarios = async () => {
      try {
        const { data, error } = await supabase.from("admin_users").select("id, nombre, email").eq("activo", true)

        if (error) {
          throw error
        }

        setUsuarios(data || [])
      } catch (err) {
        console.error("Error al cargar usuarios:", err)
      }
    }

    if (proyectoId) {
      fetchComentarios()
      fetchUsuarios()
    }

    // Configurar suscripción en tiempo real para comentarios
    const comentariosSubscription = supabase
      .channel("proyecto_comentarios_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "proyecto_comentarios",
          filter: `proyecto_id=eq.${proyectoId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Obtener el usuario del comentario
            supabase
              .from("admin_users")
              .select("id, nombre, email")
              .eq("id", payload.new.usuario_id)
              .single()
              .then(({ data: usuario }) => {
                if (usuario) {
                  const nuevoComentarioConUsuario = {
                    ...payload.new,
                    usuario,
                  } as Comentario
                  setComentarios((prev) => [nuevoComentarioConUsuario, ...prev])
                }
              })
          } else if (payload.eventType === "DELETE") {
            setComentarios((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(comentariosSubscription)
    }
  }, [proyectoId, supabase])

  const handleComentarioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const valor = e.target.value
    setNuevoComentario(valor)

    // Obtener la posición actual del cursor
    const cursorPos = e.target.selectionStart || 0
    setPosicionCursor(cursorPos)

    // Buscar el último @ antes de la posición del cursor
    const textoHastaCursor = valor.substring(0, cursorPos)
    const ultimoArrobaIndex = textoHastaCursor.lastIndexOf("@")

    if (ultimoArrobaIndex !== -1 && cursorPos - ultimoArrobaIndex <= 15) {
      // Si hay un @ y estamos a menos de 15 caracteres de él
      setUltimoArroba(ultimoArrobaIndex)
      const textoBusqueda = textoHastaCursor.substring(ultimoArrobaIndex + 1).toLowerCase()

      // Filtrar usuarios que coincidan con la búsqueda
      const usuariosFiltrados = usuarios.filter(
        (u) => u.nombre.toLowerCase().includes(textoBusqueda) || u.email.toLowerCase().includes(textoBusqueda),
      )

      setSugerenciasFiltradas(usuariosFiltrados)
      setMostrarSugerencias(usuariosFiltrados.length > 0)
    } else {
      setMostrarSugerencias(false)
    }
  }

  const insertarMencion = (usuario: Usuario) => {
    if (ultimoArroba === -1) return

    const antesDeArroba = nuevoComentario.substring(0, ultimoArroba)
    const despuesDelNombre = nuevoComentario.substring(posicionCursor)

    const nuevoTexto = `${antesDeArroba}@${usuario.nombre} ${despuesDelNombre}`
    setNuevoComentario(nuevoTexto)
    setMostrarSugerencias(false)

    // Enfocar el textarea y colocar el cursor después de la mención
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const nuevaPosicion = ultimoArroba + usuario.nombre.length + 2 // +2 por @ y espacio
        textareaRef.current.setSelectionRange(nuevaPosicion, nuevaPosicion)
      }
    }, 0)
  }

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) return

    try {
      setEnviando(true)
      setError(null)

      // Extraer menciones (formato @nombre)
      const mencionesRegex = /@([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+)/g
      const mencionesEncontradas = nuevoComentario.match(mencionesRegex) || []

      // Convertir menciones a IDs de usuario
      const mencionesIds: string[] = []

      for (const mencion of mencionesEncontradas) {
        const nombreMencionado = mencion.substring(1).trim() // Quitar el @ y espacios
        const usuarioMencionado = usuarios.find((u) => u.nombre === nombreMencionado)

        if (usuarioMencionado) {
          mencionesIds.push(usuarioMencionado.id)
        }
      }

      const { data, error } = await supabase
        .from("proyecto_comentarios")
        .insert({
          proyecto_id: proyectoId,
          usuario_id: usuarioActual.id,
          contenido: nuevoComentario,
          menciones: mencionesIds.length > 0 ? mencionesIds : null,
        })
        .select()

      if (error) {
        throw error
      }

      setNuevoComentario("")
    } catch (err) {
      console.error("Error al enviar comentario:", err)
      setError("No se pudo enviar el comentario")
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  const eliminarComentario = async (comentarioId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
      return
    }

    try {
      const { error } = await supabase.from("proyecto_comentarios").delete().eq("id", comentarioId)

      if (error) {
        throw error
      }

      setComentarios(comentarios.filter((c) => c.id !== comentarioId))
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente",
        variant: "default",
      })
    } catch (err) {
      console.error("Error al eliminar comentario:", err)
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive",
      })
    }
  }

  const formatearContenido = (contenido: string) => {
    // Resaltar menciones
    return contenido.replace(/@([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+)/g, (match) => {
      return `<span class="text-emerald-600 font-medium">${match}</span>`
    })
  }

  const obtenerIniciales = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return <div className="text-center py-4">Cargando comentarios...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-emerald-600" />
          Comentarios {comentarios.length > 0 && `(${comentarios.length})`}
        </h3>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!readOnly && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Escribe un comentario... Usa @ para mencionar a un usuario"
              value={nuevoComentario}
              onChange={handleComentarioChange}
              className="min-h-[100px] resize-y"
            />

            {/* Sugerencias de menciones */}
            {mostrarSugerencias && (
              <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                {sugerenciasFiltradas.map((usuario) => (
                  <button
                    key={usuario.id}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    onClick={() => insertarMencion(usuario)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                        {obtenerIniciales(usuario.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{usuario.nombre}</div>
                      <div className="text-xs text-gray-500">{usuario.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-2">
            <Button
              onClick={enviarComentario}
              disabled={enviando || !nuevoComentario.trim()}
              className="flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              {enviando ? "Enviando..." : "Enviar comentario"}
            </Button>
          </div>
        </div>
      )}

      {comentarios.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay comentarios en este proyecto</p>
          {!readOnly && <p className="text-sm text-gray-400 mt-2">Sé el primero en dejar un comentario</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {comentarios.map((comentario) => (
            <div key={comentario.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {comentario.usuario ? obtenerIniciales(comentario.usuario.nombre) : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{comentario.usuario?.nombre || "Usuario desconocido"}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(comentario.created_at).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {(usuarioActual.id === comentario.usuario_id || usuarioActual.role === "admin") && !readOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminarComentario(comentario.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div
                className="mt-3 text-gray-700"
                dangerouslySetInnerHTML={{ __html: formatearContenido(comentario.contenido) }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

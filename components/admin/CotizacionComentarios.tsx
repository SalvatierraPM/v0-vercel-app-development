"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { Loader2, Send, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CotizacionComentariosProps {
  cotizacionId: string
}

export default function CotizacionComentarios({ cotizacionId }: CotizacionComentariosProps) {
  const [comentarios, setComentarios] = useState<any[]>([])
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    cargarComentarios()
    cargarUsuario()
  }, [cotizacionId])

  const cargarUsuario = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

      if (data && !error) {
        setUsuario(data)
      } else {
        setUsuario({ nombre: user.email?.split("@")[0] || "Usuario" })
      }
    }
  }

  const cargarComentarios = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from("cotizacion_comentarios")
        .select("*")
        .eq("cotizacion_id", cotizacionId)
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      setComentarios(data || [])
    } catch (error) {
      console.error("Error cargando comentarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const enviarComentario = async () => {
    if (!nuevoComentario.trim() || !usuario) return

    try {
      setEnviando(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const { error } = await supabase.from("cotizacion_comentarios").insert({
        cotizacion_id: cotizacionId,
        usuario_id: user.id,
        usuario_nombre: usuario.nombre || usuario.email || "Usuario",
        contenido: nuevoComentario.trim(),
      })

      if (error) {
        throw error
      }

      setNuevoComentario("")
      cargarComentarios()

      toast({
        title: "Éxito",
        description: "Comentario añadido correctamente",
      })
    } catch (error) {
      console.error("Error enviando comentario:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comentarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cargando ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : comentarios.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No hay comentarios para esta cotización</div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
              {comentarios.map((comentario) => (
                <div key={comentario.id} className="p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{comentario.usuario_nombre}</div>
                      <div className="text-xs text-gray-500">{formatFecha(comentario.created_at)}</div>
                    </div>
                  </div>
                  <p className="text-gray-700">{comentario.contenido}</p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <Textarea
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              className="mb-2"
              rows={3}
            />
            <Button
              onClick={enviarComentario}
              disabled={enviando || !nuevoComentario.trim()}
              className="flex items-center gap-2"
            >
              {enviando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar comentario
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CotizacionTareasProps {
  cotizacionId: string
}

export default function CotizacionTareas({ cotizacionId }: CotizacionTareasProps) {
  const [tareas, setTareas] = useState<any[]>([])
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    asignado_a: "",
  })
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    cargarTareas()
    cargarUsuarios()
  }, [cotizacionId])

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, email")
        .order("nombre", { ascending: true })

      if (error) {
        throw error
      }

      setUsuarios(data || [])
    } catch (error) {
      console.error("Error cargando usuarios:", error)
    }
  }

  const cargarTareas = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from("cotizacion_tareas")
        .select(`
          *,
          usuarios:asignado_a (
            id,
            nombre,
            email
          )
        `)
        .eq("cotizacion_id", cotizacionId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setTareas(data || [])
    } catch (error) {
      console.error("Error cargando tareas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const guardarTarea = async () => {
    if (!nuevaTarea.titulo.trim()) return

    try {
      setGuardando(true)

      const { error } = await supabase.from("cotizacion_tareas").insert({
        cotizacion_id: cotizacionId,
        titulo: nuevaTarea.titulo.trim(),
        descripcion: nuevaTarea.descripcion.trim(),
        asignado_a: nuevaTarea.asignado_a || null,
      })

      if (error) {
        throw error
      }

      setNuevaTarea({
        titulo: "",
        descripcion: "",
        asignado_a: "",
      })

      setDialogOpen(false)
      cargarTareas()

      toast({
        title: "Éxito",
        description: "Tarea creada correctamente",
      })
    } catch (error) {
      console.error("Error guardando tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la tarea",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  const toggleCompletada = async (id: string, completada: boolean) => {
    try {
      const { error } = await supabase.from("cotizacion_tareas").update({ completada: !completada }).eq("id", id)

      if (error) {
        throw error
      }

      // Actualizar estado local
      setTareas(tareas.map((tarea) => (tarea.id === id ? { ...tarea, completada: !completada } : tarea)))
    } catch (error) {
      console.error("Error actualizando tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
      })
    }
  }

  const eliminarTarea = async (id: string) => {
    try {
      const { error } = await supabase.from("cotizacion_tareas").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Actualizar estado local
      setTareas(tareas.filter((tarea) => tarea.id !== id))

      toast({
        title: "Éxito",
        description: "Tarea eliminada correctamente",
      })
    } catch (error) {
      console.error("Error eliminando tarea:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tareas</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="titulo" className="text-sm font-medium">
                  Título
                </label>
                <Input
                  id="titulo"
                  value={nuevaTarea.titulo}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                  placeholder="Título de la tarea"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="descripcion" className="text-sm font-medium">
                  Descripción
                </label>
                <Textarea
                  id="descripcion"
                  value={nuevaTarea.descripcion}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                  placeholder="Descripción de la tarea"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="asignado" className="text-sm font-medium">
                  Asignado a
                </label>
                <Select
                  value={nuevaTarea.asignado_a}
                  onValueChange={(value) => setNuevaTarea({ ...nuevaTarea, asignado_a: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nombre || usuario.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={guardarTarea} disabled={guardando || !nuevaTarea.titulo.trim()}>
                {guardando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Tarea"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {cargando ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : tareas.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No hay tareas para esta cotización</div>
        ) : (
          <div className="space-y-2">
            {tareas.map((tarea) => (
              <div key={tarea.id} className={`p-3 border rounded-md ${tarea.completada ? "bg-gray-100" : "bg-white"}`}>
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={tarea.completada}
                    onCheckedChange={() => toggleCompletada(tarea.id, tarea.completada)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${tarea.completada ? "line-through text-gray-500" : ""}`}>
                      {tarea.titulo}
                    </div>
                    {tarea.descripcion && (
                      <p className={`text-sm mt-1 ${tarea.completada ? "text-gray-400" : "text-gray-600"}`}>
                        {tarea.descripcion}
                      </p>
                    )}
                    {tarea.usuarios && (
                      <div className="text-xs text-gray-500 mt-2">
                        Asignado a: {tarea.usuarios.nombre || tarea.usuarios.email || "Sin asignar"}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarTarea(tarea.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

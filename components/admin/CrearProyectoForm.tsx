"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CrearProyectoFormProps {
  cotizacionId?: string | null
}

export default function CrearProyectoForm({ cotizacionId }: CrearProyectoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cotizacion, setCotizacion] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    cliente: "",
    email: "",
    telefono: "",
    tipo_espacio: "",
    metros_cuadrados: "",
    ubicacion: "",
    descripcion: "",
    presupuesto: "",
    fecha_inicio: "",
    fecha_entrega_estimada: "",
    estado: "planificacion",
  })
  const supabase = createClient()

  useEffect(() => {
    if (cotizacionId) {
      cargarCotizacion()
    }
  }, [cotizacionId])

  const cargarCotizacion = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase.from("cotizaciones").select("*").eq("id", cotizacionId).single()

      if (error) throw error

      setCotizacion(data)

      // Pre-llenar el formulario con datos de la cotización
      setFormData({
        nombre: data.nombre_proyecto || "",
        cliente: data.nombre || "",
        email: data.email || "",
        telefono: data.telefono || "",
        tipo_espacio: data.tipo_espacio || "",
        metros_cuadrados: data.metros_cuadrados?.toString() || "",
        ubicacion: data.ubicacion || "",
        descripcion: data.descripcion_proyecto || "",
        presupuesto: data.presupuesto || "",
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_entrega_estimada: "",
        estado: "planificacion",
      })
    } catch (error) {
      console.error("Error cargando cotización:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la cotización",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setGuardando(true)

      // Validar campos requeridos
      if (!formData.nombre || !formData.cliente || !formData.email) {
        throw new Error("Por favor completa los campos obligatorios")
      }

      // Crear el proyecto
      const { data: proyecto, error: proyectoError } = await supabase
        .from("proyectos")
        .insert({
          nombre: formData.nombre,
          cliente: formData.cliente,
          email: formData.email,
          telefono: formData.telefono,
          tipo_espacio: formData.tipo_espacio,
          metros_cuadrados: formData.metros_cuadrados ? Number.parseFloat(formData.metros_cuadrados) : null,
          ubicacion: formData.ubicacion,
          descripcion: formData.descripcion,
          presupuesto: formData.presupuesto,
          fecha_inicio: formData.fecha_inicio,
          fecha_entrega_estimada: formData.fecha_entrega_estimada,
          estado: formData.estado,
          cotizacion_id: cotizacionId,
        })
        .select()
        .single()

      if (proyectoError) throw proyectoError

      // Si hay una cotización asociada, actualizar su estado
      if (cotizacionId) {
        const { error: updateError } = await supabase
          .from("cotizaciones")
          .update({ estado: "aprobada" })
          .eq("id", cotizacionId)

        if (updateError) throw updateError
      }

      toast({
        title: "Éxito",
        description: "Proyecto creado correctamente",
      })

      // Redirigir a la página del proyecto
      router.push("/admin/proyectos")
    } catch (error) {
      console.error("Error creando proyecto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el proyecto",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium mb-1">
              Nombre del Proyecto *
            </label>
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="cliente" className="block text-sm font-medium mb-1">
              Cliente *
            </label>
            <Input id="cliente" name="cliente" value={formData.cliente} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email *
            </label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium mb-1">
              Teléfono
            </label>
            <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="tipo_espacio" className="block text-sm font-medium mb-1">
              Tipo de Espacio
            </label>
            <Select value={formData.tipo_espacio} onValueChange={(value) => handleSelectChange("tipo_espacio", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de espacio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurante">Restaurante</SelectItem>
                <SelectItem value="cafe">Café</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="tienda">Tienda</SelectItem>
                <SelectItem value="oficina">Oficina</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="metros_cuadrados" className="block text-sm font-medium mb-1">
              Metros Cuadrados
            </label>
            <Input
              id="metros_cuadrados"
              name="metros_cuadrados"
              type="number"
              value={formData.metros_cuadrados}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="ubicacion" className="block text-sm font-medium mb-1">
              Ubicación
            </label>
            <Input id="ubicacion" name="ubicacion" value={formData.ubicacion} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="presupuesto" className="block text-sm font-medium mb-1">
              Presupuesto
            </label>
            <Input id="presupuesto" name="presupuesto" value={formData.presupuesto} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fecha_inicio" className="block text-sm font-medium mb-1">
            Fecha de Inicio
          </label>
          <Input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="fecha_entrega_estimada" className="block text-sm font-medium mb-1">
            Fecha de Entrega Estimada
          </label>
          <Input
            id="fecha_entrega_estimada"
            name="fecha_entrega_estimada"
            type="date"
            value={formData.fecha_entrega_estimada}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label htmlFor="estado" className="block text-sm font-medium mb-1">
          Estado del Proyecto
        </label>
        <Select value={formData.estado} onValueChange={(value) => handleSelectChange("estado", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planificacion">Planificación</SelectItem>
            <SelectItem value="diseno">Diseño</SelectItem>
            <SelectItem value="ejecucion">Ejecución</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
          Descripción del Proyecto
        </label>
        <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4} />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Crear Proyecto"
          )}
        </Button>
      </div>
    </form>
  )
}

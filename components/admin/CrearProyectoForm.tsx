"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatUF } from "@/lib/utils"

interface Cotizacion {
  id: string
  nombre: string
  email: string
  telefono: string | null
  tipo_espacio: string
  metros_cuadrados: number
  estado: string
  alcance: string
  urgencia: string
  presupuesto: string | null
  cotizacion_uf_min: number
  cotizacion_uf_max: number
  cotizacion_clp_min: number
  cotizacion_clp_max: number
  created_at: string
}

interface CrearProyectoFormProps {
  cotizacionId?: string
}

export default function CrearProyectoForm({ cotizacionId }: CrearProyectoFormProps) {
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [selectedCotizacionId, setSelectedCotizacionId] = useState<string>(cotizacionId || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    cliente_nombre: "",
    cliente_email: "",
    cliente_telefono: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin_estimada: "",
    presupuesto_total: 0,
    porcentaje_completado: 0,
    estado: "planificacion",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCotizaciones = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("cotizaciones")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setCotizaciones(data || [])

        // Si hay un cotizacionId, cargar esa cotización específica
        if (cotizacionId) {
          const cotizacionSeleccionada = data?.find((c) => c.id === cotizacionId) || null
          setCotizacion(cotizacionSeleccionada)
          if (cotizacionSeleccionada) {
            // Prellenar el formulario con datos de la cotización
            setFormData({
              ...formData,
              nombre: `Proyecto ${cotizacionSeleccionada.tipo_espacio} - ${cotizacionSeleccionada.nombre}`,
              cliente_nombre: cotizacionSeleccionada.nombre,
              cliente_email: cotizacionSeleccionada.email,
              cliente_telefono: cotizacionSeleccionada.telefono || "",
              presupuesto_total:
                Math.round(
                  ((cotizacionSeleccionada.cotizacion_uf_max + cotizacionSeleccionada.cotizacion_uf_min) / 2) * 100,
                ) / 100,
            })
          }
        }
      } catch (error) {
        console.error("Error al cargar cotizaciones:", error)
        setError("Error al cargar las cotizaciones. Por favor, intenta de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCotizaciones()
  }, [cotizacionId, supabase])

  const handleCotizacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedCotizacionId(id)

    if (id) {
      const selectedCotizacion = cotizaciones.find((c) => c.id === id) || null
      setCotizacion(selectedCotizacion)

      if (selectedCotizacion) {
        // Actualizar el formulario con datos de la cotización seleccionada
        setFormData({
          ...formData,
          nombre: `Proyecto ${selectedCotizacion.tipo_espacio} - ${selectedCotizacion.nombre}`,
          cliente_nombre: selectedCotizacion.nombre,
          cliente_email: selectedCotizacion.email,
          cliente_telefono: selectedCotizacion.telefono || "",
          presupuesto_total:
            Math.round(((selectedCotizacion.cotizacion_uf_max + selectedCotizacion.cotizacion_uf_min) / 2) * 100) / 100,
        })
      }
    } else {
      setCotizacion(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Obtener la primera etapa para asignarla por defecto
      const { data: etapasData } = await supabase.from("proyecto_etapas").select("id").order("orden").limit(1)

      const primeraEtapaId = etapasData && etapasData.length > 0 ? etapasData[0].id : null

      // Crear el proyecto en la base de datos
      const { data, error } = await supabase
        .from("proyectos")
        .insert({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          cotizacion_id: selectedCotizacionId || null,
          cliente_nombre: formData.cliente_nombre,
          cliente_email: formData.cliente_email,
          cliente_telefono: formData.cliente_telefono,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin_estimada: formData.fecha_fin_estimada || null,
          presupuesto_total: formData.presupuesto_total,
          porcentaje_completado: formData.porcentaje_completado,
          estado: formData.estado,
          etapa_id: primeraEtapaId,
        })
        .select()

      if (error) throw error

      setSuccess("Proyecto creado correctamente")

      // Redirigir a la página del proyecto después de un breve retraso
      setTimeout(() => {
        router.push(`/admin/proyectos/${data[0].id}`)
      }, 1500)
    } catch (error) {
      console.error("Error al crear el proyecto:", error)
      setError("Error al crear el proyecto. Por favor, intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Crear Nuevo Proyecto</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cotización Asociada</label>
          <select
            name="cotizacion_id"
            value={selectedCotizacionId}
            onChange={handleCotizacionChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Seleccionar cotización (opcional)</option>
            {cotizaciones.map((cotizacion) => (
              <option key={cotizacion.id} value={cotizacion.id}>
                {cotizacion.nombre} - {cotizacion.tipo_espacio} ({formatUF(cotizacion.cotizacion_uf_min)} -{" "}
                {formatUF(cotizacion.cotizacion_uf_max)} UF)
              </option>
            ))}
          </select>
        </div>

        {cotizacion && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-medium mb-2">Detalles de la cotización seleccionada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Cliente:</span> {cotizacion.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {cotizacion.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Teléfono:</span> {cotizacion.telefono || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tipo de espacio:</span> {cotizacion.tipo_espacio}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Metros cuadrados:</span> {cotizacion.metros_cuadrados} m²
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Cotización:</span> {formatUF(cotizacion.cotizacion_uf_min)} -{" "}
                  {formatUF(cotizacion.cotizacion_uf_max)} UF
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Proyecto
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="planificacion">Planificación</option>
              <option value="ejecucion">Ejecución</option>
              <option value="finalizado">Finalizado</option>
              <option value="pausado">Pausado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción del Proyecto
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="cliente_nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              id="cliente_nombre"
              name="cliente_nombre"
              value={formData.cliente_nombre}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="cliente_email" className="block text-sm font-medium text-gray-700 mb-1">
              Email del Cliente *
            </label>
            <input
              type="email"
              id="cliente_email"
              name="cliente_email"
              value={formData.cliente_email}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="cliente_telefono" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono del Cliente
            </label>
            <input
              type="text"
              id="cliente_telefono"
              name="cliente_telefono"
              value={formData.cliente_telefono}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="fecha_fin_estimada" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Finalización Estimada
            </label>
            <input
              type="date"
              id="fecha_fin_estimada"
              name="fecha_fin_estimada"
              value={formData.fecha_fin_estimada}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="presupuesto_total" className="block text-sm font-medium text-gray-700 mb-1">
              Presupuesto Total (UF)
            </label>
            <input
              type="number"
              id="presupuesto_total"
              name="presupuesto_total"
              value={formData.presupuesto_total}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="porcentaje_completado" className="block text-sm font-medium text-gray-700 mb-1">
            Porcentaje Completado: {formData.porcentaje_completado}%
          </label>
          <input
            type="range"
            id="porcentaje_completado"
            name="porcentaje_completado"
            value={formData.porcentaje_completado}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="5"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Crear Proyecto"}
          </button>
        </div>
      </form>
    </div>
  )
}

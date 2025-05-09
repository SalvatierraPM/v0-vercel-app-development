"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { formatUF } from "@/lib/utils"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface Cotizacion {
  id: string
  nombre: string
  email: string
  tipo_espacio: string
  metros_cuadrados: number
  cotizacion_uf_min: number
  cotizacion_uf_max: number
  created_at: string
  etapa_id: string | null
}

interface Etapa {
  id: string
  nombre: string
  descripcion: string | null
  color: string
  orden: number
}

export default function CotizacionesTableroRealtime() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Obtener etapas
        const { data: etapasData, error: etapasError } = await supabase
          .from("cotizacion_etapas")
          .select("*")
          .order("orden")

        if (etapasError) throw etapasError

        // Obtener cotizaciones
        const { data: cotizacionesData, error: cotizacionesError } = await supabase
          .from("cotizaciones")
          .select("*")
          .order("created_at", { ascending: false })

        if (cotizacionesError) throw cotizacionesError

        setEtapas(etapasData || [])
        setCotizaciones(cotizacionesData || [])
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar los datos. Por favor, intenta de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Configurar suscripciones en tiempo real
    const cotizacionesSubscription = supabase
      .channel("cotizaciones-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cotizaciones",
        },
        (payload) => {
          console.log("Cambio en cotizaciones:", payload)

          if (payload.eventType === "INSERT") {
            setCotizaciones((prev) => [payload.new as Cotizacion, ...prev])
            toast({
              title: "Nueva cotización",
              description: `Se ha recibido una nueva cotización de ${payload.new.nombre}`,
            })
          } else if (payload.eventType === "UPDATE") {
            setCotizaciones((prev) => prev.map((c) => (c.id === payload.new.id ? (payload.new as Cotizacion) : c)))
          } else if (payload.eventType === "DELETE") {
            setCotizaciones((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    const etapasSubscription = supabase
      .channel("etapas-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cotizacion_etapas",
        },
        (payload) => {
          console.log("Cambio en etapas:", payload)

          if (payload.eventType === "INSERT") {
            setEtapas((prev) => [...prev, payload.new as Etapa].sort((a, b) => a.orden - b.orden))
          } else if (payload.eventType === "UPDATE") {
            setEtapas((prev) =>
              prev.map((e) => (e.id === payload.new.id ? (payload.new as Etapa) : e)).sort((a, b) => a.orden - b.orden),
            )
          } else if (payload.eventType === "DELETE") {
            setEtapas((prev) => prev.filter((e) => e.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    // Limpiar suscripciones al desmontar
    return () => {
      supabase.removeChannel(cotizacionesSubscription)
      supabase.removeChannel(etapasSubscription)
    }
  }, [supabase])

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    // Si no hay destino o el destino es el mismo que el origen, no hacer nada
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Actualizar la etapa de la cotización en la base de datos
    try {
      const { error } = await supabase
        .from("cotizaciones")
        .update({ etapa_id: destination.droppableId })
        .eq("id", draggableId)

      if (error) throw error

      // La actualización del estado local se hará automáticamente a través de la suscripción
      toast({
        title: "Cotización actualizada",
        description: "La etapa de la cotización ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar la etapa:", error)
      setError("Error al actualizar la etapa. Por favor, intenta de nuevo.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="mt-4 text-gray-500">Cargando tablero de cotizaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tablero de Cotizaciones</h1>
        <div className="flex space-x-2">
          <Link
            href="/admin/cotizaciones"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Vista Lista
          </Link>
          <Link
            href="/admin/etapas/cotizacion"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Gestionar Etapas
          </Link>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex overflow-x-auto pb-4 space-x-4">
          {etapas.map((etapa) => (
            <div key={etapa.id} className="flex-shrink-0 w-80">
              <div
                className="rounded-t-lg p-3 text-white font-medium"
                style={{ backgroundColor: etapa.color || "#4B5563" }}
              >
                <div className="flex justify-between items-center">
                  <h3>{etapa.nombre}</h3>
                  <span className="bg-white bg-opacity-30 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {cotizaciones.filter((c) => c.etapa_id === etapa.id).length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={etapa.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 rounded-b-lg p-2 min-h-[70vh]"
                  >
                    {cotizaciones
                      .filter((cotizacion) => cotizacion.etapa_id === etapa.id)
                      .map((cotizacion, index) => (
                        <Draggable key={cotizacion.id} draggableId={cotizacion.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 rounded-lg shadow-sm mb-2 cursor-pointer hover:shadow-md transition-shadow"
                            >
                              <div className="font-medium text-gray-900 mb-1">{cotizacion.nombre}</div>
                              <div className="text-sm text-gray-500 mb-1">{cotizacion.email}</div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>
                                  {cotizacion.tipo_espacio} - {cotizacion.metros_cuadrados}m²
                                </span>
                                <span>
                                  {formatUF(cotizacion.cotizacion_uf_min)} - {formatUF(cotizacion.cotizacion_uf_max)} UF
                                </span>
                              </div>
                              <div className="mt-2 flex justify-end">
                                <Link
                                  href={`/admin/cotizaciones/${cotizacion.id}`}
                                  className="text-xs text-emerald-600 hover:text-emerald-800"
                                >
                                  Ver detalles
                                </Link>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}

                    {cotizaciones.filter((c) => c.etapa_id === etapa.id).length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">No hay cotizaciones en esta etapa</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}

          {/* Columna para cotizaciones sin etapa asignada */}
          <div className="flex-shrink-0 w-80">
            <div className="rounded-t-lg p-3 bg-gray-500 text-white font-medium">
              <div className="flex justify-between items-center">
                <h3>Sin clasificar</h3>
                <span className="bg-white bg-opacity-30 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {cotizaciones.filter((c) => !c.etapa_id).length}
                </span>
              </div>
            </div>

            <Droppable droppableId="sin_etapa">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 rounded-b-lg p-2 min-h-[70vh]"
                >
                  {cotizaciones
                    .filter((cotizacion) => !cotizacion.etapa_id)
                    .map((cotizacion, index) => (
                      <Draggable key={cotizacion.id} draggableId={cotizacion.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 rounded-lg shadow-sm mb-2 cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div className="font-medium text-gray-900 mb-1">{cotizacion.nombre}</div>
                            <div className="text-sm text-gray-500 mb-1">{cotizacion.email}</div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                {cotizacion.tipo_espacio} - {cotizacion.metros_cuadrados}m²
                              </span>
                              <span>
                                {formatUF(cotizacion.cotizacion_uf_min)} - {formatUF(cotizacion.cotizacion_uf_max)} UF
                              </span>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Link
                                href={`/admin/cotizaciones/${cotizacion.id}`}
                                className="text-xs text-emerald-600 hover:text-emerald-800"
                              >
                                Ver detalles
                              </Link>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}

                  {cotizaciones.filter((c) => !c.etapa_id).length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-sm">No hay cotizaciones sin clasificar</div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}

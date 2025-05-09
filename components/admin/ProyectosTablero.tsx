"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { formatCLP } from "@/lib/utils"
import Link from "next/link"

interface Proyecto {
  id: string
  nombre: string
  cliente_nombre: string
  presupuesto_total: number | null
  porcentaje_completado: number | null
  fecha_inicio: string | null
  etapa_id: string | null
}

interface Etapa {
  id: string
  nombre: string
  descripcion: string | null
  color: string
  orden: number
}

export default function ProyectosTablero() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
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
          .from("proyecto_etapas")
          .select("*")
          .order("orden")

        if (etapasError) throw etapasError

        // Obtener proyectos
        const { data: proyectosData, error: proyectosError } = await supabase
          .from("proyectos")
          .select("*")
          .order("created_at", { ascending: false })

        if (proyectosError) throw proyectosError

        setEtapas(etapasData || [])
        setProyectos(proyectosData || [])
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar los datos. Por favor, intenta de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    // Si no hay destino o el destino es el mismo que el origen, no hacer nada
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Actualizar la etapa del proyecto en la base de datos
    try {
      const { error } = await supabase
        .from("proyectos")
        .update({ etapa_id: destination.droppableId })
        .eq("id", draggableId)

      if (error) throw error

      // Actualizar el estado local
      setProyectos((prevProyectos) =>
        prevProyectos.map((proyecto) =>
          proyecto.id === draggableId ? { ...proyecto, etapa_id: destination.droppableId } : proyecto,
        ),
      )
    } catch (error) {
      console.error("Error al actualizar la etapa:", error)
      setError("Error al actualizar la etapa. Por favor, intenta de nuevo.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tablero de Proyectos</h1>
        <div className="flex space-x-2">
          <Link
            href="/admin/proyectos"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Vista Lista
          </Link>
          <Link
            href="/admin/proyectos/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Nuevo Proyecto
          </Link>
          <Link
            href="/admin/etapas/proyecto"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
                className="rounded-t-lg p-3 text-white font-medium shadow-sm"
                style={{ backgroundColor: etapa.color || "#4B5563" }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {etapa.nombre}
                  </h3>
                  <span className="bg-white bg-opacity-30 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {proyectos.filter((p) => p.etapa_id === etapa.id).length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={etapa.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 rounded-b-lg p-2 min-h-[70vh] border border-gray-100"
                  >
                    {proyectos
                      .filter((proyecto) => proyecto.etapa_id === etapa.id)
                      .map((proyecto, index) => (
                        <Draggable key={proyecto.id} draggableId={proyecto.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100 group"
                            >
                              <Link href={`/admin/proyectos/${proyecto.id}`} className="block">
                                <div className="font-medium text-emerald-600 group-hover:text-emerald-800 transition-colors mb-2">
                                  {proyecto.nombre}
                                </div>
                                <div className="text-sm text-gray-500 mb-2">Cliente: {proyecto.cliente_nombre}</div>
                                {proyecto.presupuesto_total && (
                                  <div className="text-xs text-gray-500 mb-2 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {formatCLP(proyecto.presupuesto_total)}
                                  </div>
                                )}
                                {proyecto.porcentaje_completado !== null && (
                                  <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500 ease-in-out"
                                        style={{ width: `${proyecto.porcentaje_completado}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 text-right">
                                      {proyecto.porcentaje_completado}% completado
                                    </div>
                                  </div>
                                )}
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}

                    {proyectos.filter((p) => p.etapa_id === etapa.id).length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 mx-auto mb-2 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        No hay proyectos en esta etapa
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}

          {/* Columna para proyectos sin etapa asignada */}
          <div className="flex-shrink-0 w-80">
            <div className="rounded-t-lg p-3 bg-gray-500 text-white font-medium shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Sin clasificar
                </h3>
                <span className="bg-white bg-opacity-30 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {proyectos.filter((p) => !p.etapa_id).length}
                </span>
              </div>
            </div>

            <Droppable droppableId="sin_etapa">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-50 rounded-b-lg p-2 min-h-[70vh] border border-gray-100"
                >
                  {proyectos
                    .filter((proyecto) => !proyecto.etapa_id)
                    .map((proyecto, index) => (
                      <Draggable key={proyecto.id} draggableId={proyecto.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100 group"
                          >
                            <Link href={`/admin/proyectos/${proyecto.id}`} className="block">
                              <div className="font-medium text-emerald-600 group-hover:text-emerald-800 transition-colors mb-2">
                                {proyecto.nombre}
                              </div>
                              <div className="text-sm text-gray-500 mb-2">Cliente: {proyecto.cliente_nombre}</div>
                              {proyecto.presupuesto_total && (
                                <div className="text-xs text-gray-500 mb-2 flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {formatCLP(proyecto.presupuesto_total)}
                                </div>
                              )}
                              {proyecto.porcentaje_completado !== null && (
                                <div className="mt-3">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500 ease-in-out"
                                      style={{ width: `${proyecto.porcentaje_completado}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 text-right">
                                    {proyecto.porcentaje_completado}% completado
                                  </div>
                                </div>
                              )}
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}

                  {proyectos.filter((p) => !p.etapa_id).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto mb-2 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      No hay proyectos sin clasificar
                    </div>
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

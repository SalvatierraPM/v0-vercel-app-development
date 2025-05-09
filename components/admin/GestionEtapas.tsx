"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

interface Etapa {
  id: string
  nombre: string
  descripcion: string | null
  color: string
  orden: number
}

interface GestionEtapasProps {
  tipo: "cotizacion" | "proyecto"
}

export default function GestionEtapas({ tipo }: GestionEtapasProps) {
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingEtapa, setEditingEtapa] = useState<Etapa | null>(null)
  const [newEtapa, setNewEtapa] = useState({
    nombre: "",
    descripcion: "",
    color: "#3B82F6",
  })
  const supabase = createClient()

  const tableName = tipo === "cotizacion" ? "cotizacion_etapas" : "proyecto_etapas"

  useEffect(() => {
    fetchEtapas()
  }, [])

  const fetchEtapas = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from(tableName).select("*").order("orden")

      if (error) throw error
      setEtapas(data || [])
    } catch (error) {
      console.error("Error al cargar etapas:", error)
      setError("Error al cargar las etapas. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = async (result: any) => {
    const { destination, source } = result

    // Si no hay destino o el destino es el mismo que el origen, no hacer nada
    if (!destination || destination.index === source.index) {
      return
    }

    // Reordenar las etapas localmente
    const reorderedEtapas = Array.from(etapas)
    const [removed] = reorderedEtapas.splice(source.index, 1)
    reorderedEtapas.splice(destination.index, 0, removed)

    // Actualizar el orden de las etapas
    const updatedEtapas = reorderedEtapas.map((etapa, index) => ({
      ...etapa,
      orden: index + 1,
    }))

    setEtapas(updatedEtapas)

    // Actualizar en la base de datos
    try {
      // Actualizar cada etapa con su nuevo orden
      for (const etapa of updatedEtapas) {
        await supabase.from(tableName).update({ orden: etapa.orden }).eq("id", etapa.id)
      }
    } catch (error) {
      console.error("Error al actualizar el orden:", error)
      setError("Error al actualizar el orden. Por favor, intenta de nuevo.")
      fetchEtapas() // Recargar las etapas en caso de error
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (editingEtapa) {
      setEditingEtapa({ ...editingEtapa, [name]: value })
    } else {
      setNewEtapa({ ...newEtapa, [name]: value })
    }
  }

  const handleAddEtapa = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      // Obtener el orden máximo actual
      const maxOrden = etapas.length > 0 ? Math.max(...etapas.map((e) => e.orden)) : 0

      const { data, error } = await supabase
        .from(tableName)
        .insert({
          nombre: newEtapa.nombre,
          descripcion: newEtapa.descripcion || null,
          color: newEtapa.color,
          orden: maxOrden + 1,
        })
        .select()

      if (error) throw error

      setEtapas([...etapas, data[0]])
      setNewEtapa({
        nombre: "",
        descripcion: "",
        color: "#3B82F6",
      })
      setSuccess("Etapa añadida correctamente")
    } catch (error) {
      console.error("Error al añadir etapa:", error)
      setError("Error al añadir la etapa. Por favor, intenta de nuevo.")
    }
  }

  const handleUpdateEtapa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEtapa) return

    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from(tableName)
        .update({
          nombre: editingEtapa.nombre,
          descripcion: editingEtapa.descripcion,
          color: editingEtapa.color,
        })
        .eq("id", editingEtapa.id)

      if (error) throw error

      setEtapas(etapas.map((etapa) => (etapa.id === editingEtapa.id ? editingEtapa : etapa)))
      setEditingEtapa(null)
      setSuccess("Etapa actualizada correctamente")
    } catch (error) {
      console.error("Error al actualizar etapa:", error)
      setError("Error al actualizar la etapa. Por favor, intenta de nuevo.")
    }
  }

  const handleDeleteEtapa = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta etapa? Esta acción no se puede deshacer.")) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.from(tableName).delete().eq("id", id)

      if (error) throw error

      setEtapas(etapas.filter((etapa) => etapa.id !== id))
      setSuccess("Etapa eliminada correctamente")
    } catch (error) {
      console.error("Error al eliminar etapa:", error)
      setError("Error al eliminar la etapa. Por favor, intenta de nuevo.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Etapas de {tipo === "cotizacion" ? "Cotización" : "Proyecto"}
        </h1>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Etapas Actuales</h2>
          <p className="text-sm text-gray-500 mb-4">
            Arrastra y suelta para reordenar las etapas. Haz clic en editar para modificar una etapa.
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="etapas">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {etapas.map((etapa, index) => (
                    <Draggable key={etapa.id} draggableId={etapa.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: etapa.color }}></div>
                            <div>
                              <div className="font-medium">{etapa.nombre}</div>
                              {etapa.descripcion && <div className="text-xs text-gray-500">{etapa.descripcion}</div>}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingEtapa(etapa)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteEtapa(etapa.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {etapas.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay etapas definidas</p>
            </div>
          )}
        </div>

        <div>
          {editingEtapa ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Editar Etapa</h2>
              <form onSubmit={handleUpdateEtapa} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={editingEtapa.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={editingEtapa.descripcion || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={editingEtapa.color}
                      onChange={handleInputChange}
                      className="h-10 w-10 border-0 p-0"
                    />
                    <input
                      type="text"
                      name="color"
                      value={editingEtapa.color}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingEtapa(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4">Añadir Nueva Etapa</h2>
              <form onSubmit={handleAddEtapa} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={newEtapa.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: En Negociación"
                  />
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={newEtapa.descripcion}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    placeholder="Descripción opcional de la etapa"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={newEtapa.color}
                      onChange={handleInputChange}
                      className="h-10 w-10 border-0 p-0"
                    />
                    <input
                      type="text"
                      name="color"
                      value={newEtapa.color}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                    Añadir Etapa
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { formatCLP, formatUF } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileText, ImageIcon, File, ExternalLink, Download } from "lucide-react"

interface CotizacionesListProps {
  cotizaciones: any[]
}

// Función para obtener el icono según el tipo de archivo
const getFileIcon = (tipo: string, extension: string) => {
  if (tipo === "imagen" || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />
  } else if (["pdf"].includes(extension)) {
    return <FileText className="w-5 h-5 text-red-500" />
  } else if (["doc", "docx", "txt", "rtf"].includes(extension)) {
    return <FileText className="w-5 h-5 text-blue-500" />
  } else if (["ai", "psd", "xd", "sketch", "fig"].includes(extension)) {
    return <File className="w-5 h-5 text-purple-500" />
  } else if (["mp4", "mov", "avi", "webm"].includes(extension)) {
    return <File className="w-5 h-5 text-green-500" />
  }

  return <File className="w-5 h-5 text-gray-500" />
}

export default function CotizacionesList({ cotizaciones: initialCotizaciones }: CotizacionesListProps) {
  const [cotizaciones, setCotizaciones] = useState(initialCotizaciones)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCotizacion, setSelectedCotizacion] = useState<any | null>(null)
  const [filter, setFilter] = useState<string>("todas")
  const [archivos, setArchivos] = useState<any[]>([])
  const [loadingArchivos, setLoadingArchivos] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const loadAllCotizaciones = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("cotizaciones").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCotizaciones(data || [])
    } catch (error) {
      console.error("Error al cargar cotizaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value)
  }

  const handleViewDetails = async (cotizacion: any) => {
    setSelectedCotizacion(cotizacion)

    // Cargar archivos asociados a la cotización
    setLoadingArchivos(true)
    try {
      const { data, error } = await supabase
        .from("archivos_cotizacion")
        .select("*")
        .eq("cotizacion_id", cotizacion.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setArchivos(data || [])
    } catch (error) {
      console.error("Error al cargar archivos:", error)
    } finally {
      setLoadingArchivos(false)
    }
  }

  const handleCloseDetails = () => {
    setSelectedCotizacion(null)
    setArchivos([])
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // Cambiado de "estado_cotizacion" a "estado"
      const { error } = await supabase.from("cotizaciones").update({ estado: newStatus }).eq("id", id)

      if (error) throw error

      // Actualizar la lista de cotizaciones
      setCotizaciones(cotizaciones.map((c) => (c.id === id ? { ...c, estado: newStatus } : c)))

      // Actualizar la cotización seleccionada si está abierta
      if (selectedCotizacion && selectedCotizacion.id === id) {
        setSelectedCotizacion({ ...selectedCotizacion, estado: newStatus })
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    }
  }

  const handleCreateProject = async (cotizacionId: string) => {
    router.push(`/admin/proyectos/nuevo?cotizacion=${cotizacionId}`)
  }

  // Filtrar cotizaciones
  const filteredCotizaciones = cotizaciones.filter((cotizacion) => {
    const matchesSearch =
      cotizacion.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.tipo_espacio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cotizacion.tipo_servicio && cotizacion.tipo_servicio.toLowerCase().includes(searchTerm.toLowerCase()))

    let matchesFilter = filter === "todas"

    if (filter === "pendientes") {
      matchesFilter = !cotizacion.estado || cotizacion.estado === "pendiente"
    } else if (filter === "aprobadas") {
      matchesFilter = cotizacion.estado === "aprobada"
    } else if (filter === "rechazadas") {
      matchesFilter = cotizacion.estado === "rechazada"
    } else if (filter === "diseno_interiores") {
      matchesFilter = cotizacion.tipo_servicio === "diseno_interiores"
    } else if (filter === "branding") {
      matchesFilter = cotizacion.tipo_servicio === "branding"
    } else if (filter === "ambos") {
      matchesFilter = cotizacion.tipo_servicio === "ambos"
    }

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Cotizaciones</h1>
        <div className="flex space-x-2">
          <Link
            href="/admin/cotizaciones/tablero"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Ver Tablero
          </Link>
          <button
            onClick={loadAllCotizaciones}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Cargar todas"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Buscar por nombre, email o tipo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="w-full md:w-1/4">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="todas">Todas las cotizaciones</option>
              <option value="pendientes">Pendientes</option>
              <option value="aprobadas">Aprobadas</option>
              <option value="rechazadas">Rechazadas</option>
              <option value="diseno_interiores">Diseño de interiores</option>
              <option value="branding">Branding</option>
              <option value="ambos">Ambos servicios</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cotización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCotizaciones.length > 0 ? (
                filteredCotizaciones.map((cotizacion) => (
                  <tr key={cotizacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cotizacion.created_at).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cotizacion.nombre}</div>
                      <div className="text-sm text-gray-500">{cotizacion.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cotizacion.tipo_servicio === "diseno_interiores"
                        ? "Diseño de interiores"
                        : cotizacion.tipo_servicio === "branding"
                          ? "Branding"
                          : cotizacion.tipo_servicio === "ambos"
                            ? "Diseño + Branding"
                            : cotizacion.tipo_espacio || "No especificado"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatUF(cotizacion.cotizacion_uf_min)} - {formatUF(cotizacion.cotizacion_uf_max)} UF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cotizacion.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : cotizacion.estado === "aprobada"
                              ? "bg-green-100 text-green-800"
                              : cotizacion.estado === "rechazada"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {cotizacion.estado || "pendiente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(cotizacion)}
                        className="text-emerald-600 hover:text-emerald-900 mr-3"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(cotizacion.id, "aprobada")}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(cotizacion.id, "rechazada")}
                        className="text-red-600 hover:text-red-900"
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron cotizaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedCotizacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Detalles de la cotización</h2>
                <button onClick={handleCloseDetails} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Información del cliente</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2">
                      <span className="font-medium">Nombre:</span> {selectedCotizacion.nombre}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Email:</span> {selectedCotizacion.email}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Teléfono:</span> {selectedCotizacion.telefono || "-"}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(selectedCotizacion.created_at).toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Detalles del proyecto</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2">
                      <span className="font-medium">Tipo de servicio:</span>{" "}
                      {selectedCotizacion.tipo_servicio === "diseno_interiores"
                        ? "Diseño de interiores"
                        : selectedCotizacion.tipo_servicio === "branding"
                          ? "Branding"
                          : selectedCotizacion.tipo_servicio === "ambos"
                            ? "Diseño + Branding"
                            : "No especificado"}
                    </p>

                    {(selectedCotizacion.tipo_servicio === "diseno_interiores" ||
                      selectedCotizacion.tipo_servicio === "ambos") && (
                      <>
                        <p className="mb-2">
                          <span className="font-medium">Tipo de espacio:</span> {selectedCotizacion.tipo_espacio || "-"}
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Metros cuadrados:</span>{" "}
                          {selectedCotizacion.metros_cuadrados || "-"} m²
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Estado:</span>{" "}
                          {selectedCotizacion.estado?.replace("_", " ") || "-"}
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Alcance:</span>{" "}
                          {selectedCotizacion.alcance?.replace("_", " ") || "-"}
                        </p>
                      </>
                    )}

                    {(selectedCotizacion.tipo_servicio === "branding" ||
                      selectedCotizacion.tipo_servicio === "ambos") && (
                      <>
                        <p className="mb-2">
                          <span className="font-medium">Tipo de branding:</span>{" "}
                          {selectedCotizacion.tipo_branding?.replace("_", " ") || "-"}
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Industria:</span> {selectedCotizacion.industria || "-"}
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Tiene logo:</span> {selectedCotizacion.tiene_logo ? "Sí" : "No"}
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Tiene materiales:</span>{" "}
                          {selectedCotizacion.tiene_materiales ? "Sí" : "No"}
                        </p>
                      </>
                    )}

                    <p className="mb-2">
                      <span className="font-medium">Urgencia:</span> {selectedCotizacion.urgencia}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Presupuesto:</span> {selectedCotizacion.presupuesto || "-"}
                    </p>

                    {selectedCotizacion.descripcion_proyecto && (
                      <p className="mb-2">
                        <span className="font-medium">Descripción:</span> {selectedCotizacion.descripcion_proyecto}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Cotización</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">UF</p>
                      <p className="text-xl font-bold text-emerald-800">
                        {formatUF(selectedCotizacion.cotizacion_uf_min)} -{" "}
                        {formatUF(selectedCotizacion.cotizacion_uf_max)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">CLP (aproximado)</p>
                      <p className="text-xl font-bold text-gray-800">
                        {formatCLP(selectedCotizacion.cotizacion_clp_min)} -{" "}
                        {formatCLP(selectedCotizacion.cotizacion_clp_max)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Archivos adjuntos */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Archivos adjuntos</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {loadingArchivos ? (
                    <p className="text-center py-4 text-gray-500">Cargando archivos...</p>
                  ) : archivos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {archivos.map((archivo) => {
                        const extension = archivo.nombre.split(".").pop()?.toLowerCase() || ""
                        return (
                          <div
                            key={archivo.id}
                            className="flex items-center p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50"
                          >
                            {getFileIcon(archivo.tipo || "", extension)}
                            <div className="ml-3 flex-1 truncate">
                              <p className="text-sm font-medium text-gray-900 truncate">{archivo.nombre}</p>
                              <p className="text-xs text-gray-500">
                                {archivo.tipo || extension} •{" "}
                                {archivo.tamano
                                  ? `${(archivo.tamano / 1024 / 1024).toFixed(2)} MB`
                                  : "Tamaño desconocido"}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <a
                                href={archivo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="Ver archivo"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              <a
                                href={archivo.url}
                                download
                                className="text-green-600 hover:text-green-800"
                                title="Descargar archivo"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">No hay archivos adjuntos a esta cotización</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Estado de la cotización</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleUpdateStatus(selectedCotizacion.id, "pendiente")}
                    className={`px-4 py-2 rounded-md ${
                      selectedCotizacion.estado === "pendiente"
                        ? "bg-yellow-500 text-white"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCotizacion.id, "aprobada")}
                    className={`px-4 py-2 rounded-md ${
                      selectedCotizacion.estado === "aprobada"
                        ? "bg-green-500 text-white"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    Aprobada
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedCotizacion.id, "rechazada")}
                    className={`px-4 py-2 rounded-md ${
                      selectedCotizacion.estado === "rechazada" ? "bg-red-500 text-white" : "bg-red-100 text-red-800"
                    }`}
                  >
                    Rechazada
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => handleCreateProject(selectedCotizacion.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Crear Proyecto
                </button>
                <button
                  onClick={handleCloseDetails}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

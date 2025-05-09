"use client"

import { useState } from "react"
import { formatCLP, formatUF } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Archivo {
  id: string
  cotizacion_id: string
  url: string
  nombre: string
}

interface Cotizacion {
  id: string
  created_at: string
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
  archivos_cotizacion: Archivo[]
}

interface AdminPanelProps {
  cotizaciones: Cotizacion[]
}

export default function AdminPanel({ cotizaciones }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null)
  const supabase = createClient()

  const filteredCotizaciones = cotizaciones.filter(
    (cotizacion) =>
      cotizacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.tipo_espacio.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/admin/login"
  }

  const handleGeneratePdf = async (id: string) => {
    try {
      const response = await fetch(`/api/generate-pdf?id=${id}`)
      if (!response.ok) throw new Error("Error al generar PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cotizacion-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error al descargar PDF:", error)
      alert("Hubo un error al generar el PDF. Por favor intenta nuevamente.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, email o tipo de espacio..."
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M²</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cotización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCotizaciones.length > 0 ? (
                filteredCotizaciones.map((cotizacion) => (
                  <tr key={cotizacion.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cotizacion.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cotizacion.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cotizacion.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cotizacion.telefono || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cotizacion.tipo_espacio}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cotizacion.metros_cuadrados}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatUF(cotizacion.cotizacion_uf_min)} - {formatUF(cotizacion.cotizacion_uf_max)} UF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedCotizacion(cotizacion)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleGeneratePdf(cotizacion.id)}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron cotizaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCotizacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Detalles de la cotización</h2>
                <button onClick={() => setSelectedCotizacion(null)} className="text-gray-500 hover:text-gray-700">
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
                      <span className="font-medium">Tipo de espacio:</span> {selectedCotizacion.tipo_espacio}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Metros cuadrados:</span> {selectedCotizacion.metros_cuadrados} m²
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Estado:</span> {selectedCotizacion.estado.replace("_", " ")}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Alcance:</span> {selectedCotizacion.alcance.replace("_", " ")}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Urgencia:</span> {selectedCotizacion.urgencia}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Presupuesto:</span> {selectedCotizacion.presupuesto || "-"}
                    </p>
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

              {selectedCotizacion.archivos_cotizacion && selectedCotizacion.archivos_cotizacion.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Archivos adjuntos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCotizacion.archivos_cotizacion.map((archivo) => (
                      <a
                        key={archivo.id}
                        href={archivo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-blue-600 truncate">{archivo.nombre}</p>
                        <p className="text-xs text-gray-500 mt-1">Ver archivo</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => handleGeneratePdf(selectedCotizacion.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { FileText, ImageIcon, File, Download, ExternalLink, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CotizacionArchivosProps {
  cotizacionId: string
  onDelete?: (archivoId: string) => void
  readOnly?: boolean
}

interface Archivo {
  id: string
  nombre: string
  url: string
  tipo?: string
  tamano?: number
  created_at: string
}

export default function CotizacionArchivos({ cotizacionId, onDelete, readOnly = false }: CotizacionArchivosProps) {
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("archivos_cotizacion")
          .select("*")
          .eq("cotizacion_id", cotizacionId)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setArchivos(data || [])
      } catch (err) {
        console.error("Error al cargar archivos:", err)
        setError("No se pudieron cargar los archivos")
      } finally {
        setLoading(false)
      }
    }

    if (cotizacionId) {
      fetchArchivos()
    }
  }, [cotizacionId, supabase])

  const handleDelete = async (archivoId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este archivo?")) {
      return
    }

    try {
      const { error } = await supabase.from("archivos_cotizacion").delete().eq("id", archivoId)

      if (error) {
        throw error
      }

      setArchivos(archivos.filter((archivo) => archivo.id !== archivoId))

      if (onDelete) {
        onDelete(archivoId)
      }
    } catch (err) {
      console.error("Error al eliminar archivo:", err)
      alert("No se pudo eliminar el archivo")
    }
  }

  const getFileIcon = (archivo: Archivo) => {
    const extension = archivo.nombre.split(".").pop()?.toLowerCase() || ""
    const tipo = archivo.tipo || ""

    if (tipo === "imagen" || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />
    } else if (tipo === "documento" || ["pdf"].includes(extension)) {
      return <FileText className="w-5 h-5 text-red-500" />
    } else if (tipo === "documento" || ["doc", "docx", "txt", "rtf"].includes(extension)) {
      return <FileText className="w-5 h-5 text-blue-500" />
    } else if (tipo === "diseno" || ["ai", "psd", "xd", "sketch", "fig"].includes(extension)) {
      return <File className="w-5 h-5 text-purple-500" />
    } else if (tipo === "video" || ["mp4", "mov", "avi", "webm"].includes(extension)) {
      return <File className="w-5 h-5 text-green-500" />
    }

    return <File className="w-5 h-5 text-gray-500" />
  }

  if (loading) {
    return <div className="text-center py-4">Cargando archivos...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>
  }

  if (archivos.length === 0) {
    return <div className="text-center py-4 text-gray-500">No hay archivos adjuntos a esta cotización</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Archivos adjuntos ({archivos.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archivos.map((archivo) => (
          <div key={archivo.id} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-md">{getFileIcon(archivo)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={archivo.nombre}>
                    {archivo.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(archivo.created_at).toLocaleDateString()}
                    {archivo.tamano && ` · ${(archivo.tamano / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Descargar archivo">
                  <a href={archivo.url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Ver archivo">
                  <a href={archivo.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Eliminar archivo"
                    onClick={() => handleDelete(archivo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

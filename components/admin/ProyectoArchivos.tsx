"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { FileText, ImageIcon, File, Download, ExternalLink, Trash2, Upload, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProyectoArchivosProps {
  proyectoId: string
  onDelete?: (archivoId: string) => void
  readOnly?: boolean
  allowUpload?: boolean
}

interface Archivo {
  id: string
  proyecto_id: string
  cotizacion_archivo_id: string | null
  url: string
  nombre: string
  tipo?: string
  tamano?: number
  descripcion?: string
  created_at: string
}

export default function ProyectoArchivos({
  proyectoId,
  onDelete,
  readOnly = false,
  allowUpload = true,
}: ProyectoArchivosProps) {
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("archivos_proyecto")
          .select("*")
          .eq("proyecto_id", proyectoId)
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

    if (proyectoId) {
      fetchArchivos()
    }
  }, [proyectoId, supabase])

  const handleDelete = async (archivoId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este archivo?")) {
      return
    }

    try {
      const { error } = await supabase.from("archivos_proyecto").delete().eq("id", archivoId)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `proyectos/${proyectoId}/${fileName}`

        // Subir archivo a Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage.from("archivos").upload(filePath, file)

        if (uploadError) throw uploadError

        // Obtener URL pública del archivo
        const {
          data: { publicUrl },
        } = supabase.storage.from("archivos").getPublicUrl(filePath)

        // Guardar referencia en la base de datos
        const { data: archivoData, error: insertError } = await supabase
          .from("archivos_proyecto")
          .insert({
            proyecto_id: proyectoId,
            nombre: file.name,
            url: publicUrl,
            tipo: determinarTipoArchivo(file.name),
            tamano: file.size,
            created_at: new Date().toISOString(),
          })
          .select()

        if (insertError) throw insertError

        // Actualizar la lista de archivos
        if (archivoData && archivoData.length > 0) {
          setArchivos((prev) => [archivoData[0], ...prev])
        }
      }
    } catch (err) {
      console.error("Error al subir archivo:", err)
      setUploadError("Error al subir el archivo. Por favor, intenta de nuevo.")
    } finally {
      setUploading(false)
      // Limpiar el input de archivos
      e.target.value = ""
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

  const determinarTipoArchivo = (nombreArchivo: string) => {
    const extension = nombreArchivo.split(".").pop()?.toLowerCase() || ""

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
      return "imagen"
    } else if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension)) {
      return "documento"
    } else if (["ai", "psd", "xd", "sketch", "fig"].includes(extension)) {
      return "diseno"
    } else if (["mp4", "mov", "avi", "webm"].includes(extension)) {
      return "video"
    }

    return "otro"
  }

  if (loading) {
    return <div className="text-center py-4">Cargando archivos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Archivos del proyecto {archivos.length > 0 && `(${archivos.length})`}</h3>

        {allowUpload && !readOnly && (
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button variant="outline" size="sm" className="flex items-center" disabled={uploading}>
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Subir archivo
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{uploadError}</p>
        </div>
      )}

      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      {archivos.length === 0 && !error ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay archivos adjuntos a este proyecto</p>
          {allowUpload && !readOnly && (
            <p className="text-sm text-gray-400 mt-2">Haz clic en "Subir archivo" para añadir documentos</p>
          )}
        </div>
      ) : (
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
                      {archivo.cotizacion_archivo_id && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          De cotización
                        </span>
                      )}
                    </p>
                    {archivo.descripcion && <p className="text-xs text-gray-600 mt-1">{archivo.descripcion}</p>}
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
      )}
    </div>
  )
}

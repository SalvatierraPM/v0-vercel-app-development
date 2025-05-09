"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { Loader2, Upload, File, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CotizacionUploadFilesProps {
  cotizacionId: string
}

export default function CotizacionUploadFiles({ cotizacionId }: CotizacionUploadFilesProps) {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    fetchFiles()
  }, [cotizacionId])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("cotizacion_archivos")
        .select("*")
        .eq("cotizacion_id", cotizacionId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setFiles(data || [])
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const fileList = event.target.files
      if (!fileList || fileList.length === 0) return

      setUploading(true)

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `cotizaciones/${cotizacionId}/${fileName}`

        // Upload file to storage
        const { error: uploadError } = await supabase.storage.from("archivos").upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from("archivos").getPublicUrl(filePath)

        // Save file reference in database
        const { error: dbError } = await supabase.from("cotizacion_archivos").insert({
          cotizacion_id: cotizacionId,
          nombre_archivo: file.name,
          tipo_archivo: file.type,
          tamano_archivo: file.size,
          url_archivo: publicUrlData.publicUrl,
          ruta_archivo: filePath,
        })

        if (dbError) {
          throw dbError
        }
      }

      toast({
        title: "Éxito",
        description: "Archivos subidos correctamente",
      })

      // Refresh file list
      fetchFiles()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    }
  }

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage.from("archivos").remove([filePath])

      if (storageError) {
        throw storageError
      }

      // Delete from database
      const { error: dbError } = await supabase.from("cotizacion_archivos").delete().eq("id", fileId)

      if (dbError) {
        throw dbError
      }

      // Update state
      setFiles(files.filter((file) => file.id !== fileId))

      toast({
        title: "Éxito",
        description: "Archivo eliminado correctamente",
      })
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Archivos de la Cotización</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir Archivo
                </>
              )}
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No hay archivos adjuntos a esta cotización</div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{file.nombre_archivo}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.tamano_archivo)} • {new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.url_archivo} target="_blank" rel="noopener noreferrer">
                        Ver
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteFile(file.id, file.ruta_archivo)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Eye, FileText } from "lucide-react"

export default function CotizacionesList() {
  const router = useRouter()
  const { toast } = useToast()
  const [cotizaciones, setCotizaciones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    cargarCotizaciones()

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("cotizaciones_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cotizaciones",
        },
        () => {
          cargarCotizaciones()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const cargarCotizaciones = async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase.from("cotizaciones").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setCotizaciones(data || [])
    } catch (error) {
      console.error("Error cargando cotizaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las cotizaciones",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatearEstado = (estado: string) => {
    if (!estado) return "No definido"

    return estado
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case "nueva":
        return "bg-blue-100 text-blue-800"
      case "en_proceso":
        return "bg-yellow-100 text-yellow-800"
      case "aprobada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      {cargando ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : cotizaciones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay cotizaciones disponibles</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de Espacio</TableHead>
                <TableHead>Fase Actual</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotizaciones.map((cotizacion) => (
                <TableRow key={cotizacion.id}>
                  <TableCell className="font-medium">{cotizacion.nombre}</TableCell>
                  <TableCell>{cotizacion.tipo_espacio}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getColorEstado(cotizacion.estado)}>
                      {formatearEstado(cotizacion.estado)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatearFecha(cotizacion.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/cotizaciones/${cotizacion.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/proyectos/nuevo?cotizacion=${cotizacion.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Crear Proyecto
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

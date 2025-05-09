"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import CotizacionUploadFiles from "@/components/admin/CotizacionUploadFiles"
import CotizacionComentarios from "@/components/admin/CotizacionComentarios"
import CotizacionTareas from "@/components/admin/CotizacionTareas"

export default function DetalleCotizacion() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [cotizacion, setCotizacion] = useState<any | null>(null)
  const [cargando, setCargando] = useState(true)
  const [creandoProyecto, setCreandoProyecto] = useState(false)
  const supabase = createClient()
  const cotizacionId = params.id as string

  useEffect(() => {
    async function cargarCotizacion() {
      try {
        const { data, error } = await supabase.from("cotizaciones").select("*").eq("id", cotizacionId).single()

        if (error) throw error
        setCotizacion(data)
      } catch (error) {
        console.error("Error al cargar cotización:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la cotización",
          variant: "destructive",
        })
      } finally {
        setCargando(false)
      }
    }

    cargarCotizacion()
  }, [cotizacionId])

  async function crearProyecto() {
    if (!cotizacion) return

    setCreandoProyecto(true)
    try {
      // Redirigir a la página de creación de proyecto con el ID de la cotización
      router.push(`/admin/proyectos/nuevo?cotizacion=${cotizacionId}`)
    } catch (error) {
      console.error("Error al crear proyecto:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto",
        variant: "destructive",
      })
      setCreandoProyecto(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!cotizacion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Cotización no encontrada</h1>
        <Button onClick={() => router.push("/admin/cotizaciones")}>Volver a cotizaciones</Button>
      </div>
    )
  }

  // Formatear fecha
  const fechaCreacion = new Date(cotizacion.created_at).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Detalle de Cotización</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/cotizaciones")}>
            Volver
          </Button>
          <Button onClick={crearProyecto} disabled={creandoProyecto}>
            {creandoProyecto ? "Creando..." : "Crear Proyecto"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Nombre</h3>
                <p>{cotizacion.nombre}</p>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>{cotizacion.email}</p>
              </div>
              <div>
                <h3 className="font-semibold">Teléfono</h3>
                <p>{cotizacion.telefono || "No proporcionado"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Fecha de creación</h3>
                <p>{fechaCreacion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cotización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">Rango en UF</h3>
                <p>
                  {cotizacion.cotizacion_uf_min} - {cotizacion.cotizacion_uf_max} UF
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Rango en CLP</h3>
                <p>
                  ${cotizacion.cotizacion_clp_min?.toLocaleString("es-CL") || 0} - $
                  {cotizacion.cotizacion_clp_max?.toLocaleString("es-CL") || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalles del Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Tipo de espacio</h3>
                <p>{cotizacion.tipo_espacio}</p>
              </div>
              <div>
                <h3 className="font-semibold">Metros cuadrados</h3>
                <p>{cotizacion.metros_cuadrados} m²</p>
              </div>
              <div>
                <h3 className="font-semibold">Fase actual</h3>
                <p>{cotizacion.estado?.replace(/_/g, " ") || "No especificada"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Alcance</h3>
                <p>{cotizacion.alcance?.replace(/_/g, " ") || "No especificado"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Urgencia</h3>
                <p>{cotizacion.urgencia || "No especificada"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Presupuesto</h3>
                <p>{cotizacion.presupuesto || "No especificado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="archivos">
        <TabsList>
          <TabsTrigger value="archivos">Archivos</TabsTrigger>
          <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
        </TabsList>
        <TabsContent value="archivos" className="space-y-4">
          <CotizacionUploadFiles cotizacionId={cotizacionId} />
        </TabsContent>
        <TabsContent value="comentarios">
          <CotizacionComentarios cotizacionId={cotizacionId} />
        </TabsContent>
        <TabsContent value="tareas">
          <CotizacionTareas cotizacionId={cotizacionId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

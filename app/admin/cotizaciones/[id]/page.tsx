import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText, Calendar, User, MapPin, Phone, Mail, Building, DollarSign } from "lucide-react"
import CotizacionUploadFiles from "@/components/admin/CotizacionUploadFiles"
import CotizacionComentarios from "@/components/admin/CotizacionComentarios"
import CotizacionTareas from "@/components/admin/CotizacionTareas"

export const dynamic = "force-dynamic"

export default async function CotizacionDetalle({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/admin/login")
  }

  // Obtener datos de la cotización
  const { data: cotizacion, error } = await supabase
    .from("cotizaciones")
    .select(`
      *,
      branding_info (*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !cotizacion) {
    console.error("Error fetching cotizacion:", error)
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>No se pudo cargar la cotización. Por favor, intente nuevamente.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/cotizaciones">Volver a cotizaciones</Link>
        </Button>
      </div>
    )
  }

  // Formatear la fase actual para mostrarla sin guiones bajos y con la primera letra en mayúscula
  const formatearFase = (fase: string) => {
    if (!fase) return "No definida"
    return fase
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Detalle de Cotización</h1>
        <Button asChild variant="outline">
          <Link href="/admin/cotizaciones">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cotizaciones
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Proyecto</p>
                      <p className="font-medium">{cotizacion.nombre_proyecto || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de creación</p>
                      <p className="font-medium">
                        {new Date(cotizacion.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Cliente</p>
                      <p className="font-medium">{cotizacion.nombre_cliente || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="font-medium">{cotizacion.ubicacion || "No especificada"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium">{cotizacion.telefono || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{cotizacion.email || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo de espacio</p>
                      <p className="font-medium">{cotizacion.tipo_espacio || "No especificado"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Presupuesto</p>
                      <p className="font-medium">
                        {cotizacion.presupuesto
                          ? `$${Number.parseInt(cotizacion.presupuesto).toLocaleString("es-CL")}`
                          : "No especificado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">Descripción del proyecto</h3>
                <p className="text-gray-700">{cotizacion.descripcion_proyecto || "No hay descripción disponible."}</p>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">Fase Actual</h3>
                <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {formatearFase(cotizacion.estado)}
                </div>
              </div>
            </CardContent>
          </Card>

          {cotizacion.branding_info && (
            <Card>
              <CardHeader>
                <CardTitle>Información de Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cotizacion.branding_info.tiene_branding && (
                    <>
                      <div>
                        <h3 className="font-medium mb-1">Estado del branding</h3>
                        <p>{cotizacion.branding_info.estado_branding || "No especificado"}</p>
                      </div>

                      {cotizacion.branding_info.colores_corporativos && (
                        <div>
                          <h3 className="font-medium mb-1">Colores corporativos</h3>
                          <p>{cotizacion.branding_info.colores_corporativos}</p>
                        </div>
                      )}

                      {cotizacion.branding_info.estilo_deseado && (
                        <div>
                          <h3 className="font-medium mb-1">Estilo deseado</h3>
                          <p>{cotizacion.branding_info.estilo_deseado}</p>
                        </div>
                      )}
                    </>
                  )}

                  {!cotizacion.branding_info.tiene_branding && <p>El cliente no cuenta con branding establecido.</p>}
                </div>
              </CardContent>
            </Card>
          )}

          <CotizacionUploadFiles cotizacionId={params.id} />
        </div>

        <div className="space-y-6">
          <CotizacionTareas cotizacionId={params.id} />
          <CotizacionComentarios cotizacionId={params.id} />
        </div>
      </div>
    </div>
  )
}

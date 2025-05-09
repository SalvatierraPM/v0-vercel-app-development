import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import CotizacionArchivos from "@/components/admin/CotizacionArchivos"

export default async function CotizacionDetalle({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  // Obtener datos de la cotización
  const { data: cotizacion, error } = await supabase.from("cotizaciones").select("*").eq("id", params.id).single()

  if (error || !cotizacion) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Cotización no encontrada</h1>
        <p className="text-gray-600 mb-4">La cotización que buscas no existe o no tienes permisos para verla.</p>
        <Link href="/admin/cotizaciones">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver a cotizaciones
          </Button>
        </Link>
      </div>
    )
  }

  // Obtener información de branding si existe
  const { data: brandingInfo } = await supabase
    .from("branding_info")
    .select("*")
    .eq("cotizacion_id", params.id)
    .single()

  // Formatear fecha
  const fechaCreacion = new Date(cotizacion.created_at).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detalle de Cotización</h1>
        <Link href="/admin/cotizaciones">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver a cotizaciones
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Nombre:</span> {cotizacion.nombre}
              </p>
              <p>
                <span className="font-medium">Email:</span> {cotizacion.email}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span> {cotizacion.telefono || "No especificado"}
              </p>
              <p>
                <span className="font-medium">Fecha de solicitud:</span> {fechaCreacion}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Detalles de la Cotización</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Tipo de servicio:</span> {cotizacion.tipo_servicio}
              </p>
              {(cotizacion.tipo_servicio === "diseno_interiores" || cotizacion.tipo_servicio === "ambos") && (
                <>
                  <p>
                    <span className="font-medium">Tipo de espacio:</span> {cotizacion.tipo_espacio}
                  </p>
                  <p>
                    <span className="font-medium">Metros cuadrados:</span> {cotizacion.metros_cuadrados} m²
                  </p>
                  <p>
                    <span className="font-medium">Estado actual:</span> {cotizacion.estado}
                  </p>
                  <p>
                    <span className="font-medium">Alcance:</span> {cotizacion.alcance}
                  </p>
                </>
              )}
              <p>
                <span className="font-medium">Urgencia:</span> {cotizacion.urgencia}
              </p>
              <p>
                <span className="font-medium">Presupuesto:</span> {cotizacion.presupuesto || "No especificado"}
              </p>
            </div>
          </div>
        </div>

        {brandingInfo && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Información de Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Tipo de proyecto:</span> {brandingInfo.tipo_branding}
                </p>
                <p>
                  <span className="font-medium">Industria:</span> {brandingInfo.industria || "No especificado"}
                </p>
                <p>
                  <span className="font-medium">Ya tiene logo:</span> {brandingInfo.tiene_logo ? "Sí" : "No"}
                </p>
                <p>
                  <span className="font-medium">Tiene materiales:</span> {brandingInfo.tiene_materiales ? "Sí" : "No"}
                </p>
              </div>
              {brandingInfo.descripcion_proyecto && (
                <div>
                  <p className="font-medium">Descripción del proyecto:</p>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">{brandingInfo.descripcion_proyecto}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Cotización Estimada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Rango UF:</span> {cotizacion.cotizacion_uf_min} UF -{" "}
                {cotizacion.cotizacion_uf_max} UF
              </p>
              <p>
                <span className="font-medium">Rango CLP:</span> ${cotizacion.cotizacion_clp_min.toLocaleString("es-CL")}{" "}
                - ${cotizacion.cotizacion_clp_max.toLocaleString("es-CL")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <CotizacionArchivos cotizacionId={params.id} />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link href={`/admin/proyectos/nuevo?cotizacion=${params.id}`}>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Crear Proyecto
          </Button>
        </Link>
      </div>
    </div>
  )
}

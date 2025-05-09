import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatCLP } from "@/lib/utils"

export default async function ProyectoDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  // Verificar si el usuario es administrador
  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("email", session.user.email).single()

  if (!adminUser) {
    redirect("/admin/unauthorized")
  }

  // Obtener datos del proyecto
  const { data: proyecto, error } = await supabase
    .from("proyectos")
    .select(`
      *,
      cotizacion_id (*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !proyecto) {
    redirect("/admin/proyectos")
  }

  // Obtener la etapa del proyecto
  const { data: etapa } = await supabase.from("proyecto_etapas").select("*").eq("id", proyecto.etapa_id).single()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{proyecto.nombre}</h1>
        <div className="flex space-x-2">
          <Link
            href="/admin/proyectos"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Volver a Proyectos
          </Link>
          <Link
            href={`/admin/proyectos/${params.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Editar Proyecto
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">{proyecto.nombre}</h2>
            <p className="text-gray-500">{proyecto.descripcion}</p>
          </div>
          {etapa && (
            <div
              className="px-3 py-1 text-white text-sm font-medium rounded-full"
              style={{ backgroundColor: etapa.color }}
            >
              {etapa.nombre}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Información del Cliente</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2">
                <span className="font-medium">Nombre:</span> {proyecto.cliente_nombre}
              </p>
              <p className="mb-2">
                <span className="font-medium">Email:</span> {proyecto.cliente_email}
              </p>
              <p className="mb-2">
                <span className="font-medium">Teléfono:</span> {proyecto.cliente_telefono || "-"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Detalles del Proyecto</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2">
                <span className="font-medium">Estado:</span>{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    proyecto.estado === "planificacion"
                      ? "bg-blue-100 text-blue-800"
                      : proyecto.estado === "ejecucion"
                        ? "bg-yellow-100 text-yellow-800"
                        : proyecto.estado === "finalizado"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {proyecto.estado}
                </span>
              </p>
              <p className="mb-2">
                <span className="font-medium">Fecha de inicio:</span>{" "}
                {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString("es-ES") : "-"}
              </p>
              <p className="mb-2">
                <span className="font-medium">Fecha estimada de finalización:</span>{" "}
                {proyecto.fecha_fin_estimada ? new Date(proyecto.fecha_fin_estimada).toLocaleDateString("es-ES") : "-"}
              </p>
              <p className="mb-2">
                <span className="font-medium">Presupuesto total:</span>{" "}
                {proyecto.presupuesto_total ? formatCLP(proyecto.presupuesto_total) : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Progreso del Proyecto</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Completado</span>
              <span className="text-sm font-medium">{proyecto.porcentaje_completado}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-emerald-600 h-2.5 rounded-full"
                style={{ width: `${proyecto.porcentaje_completado}%` }}
              ></div>
            </div>
          </div>
        </div>

        {proyecto.cotizacion_id && (
          <div>
            <h3 className="text-lg font-medium mb-3">Cotización Asociada</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2">
                <span className="font-medium">Cliente:</span> {proyecto.cotizacion_id.nombre}
              </p>
              <p className="mb-2">
                <span className="font-medium">Tipo de espacio:</span> {proyecto.cotizacion_id.tipo_espacio}
              </p>
              <p className="mb-2">
                <span className="font-medium">Metros cuadrados:</span> {proyecto.cotizacion_id.metros_cuadrados} m²
              </p>
              <div className="mt-3">
                <Link
                  href={`/admin/cotizaciones/${proyecto.cotizacion_id.id}`}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  Ver cotización completa
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

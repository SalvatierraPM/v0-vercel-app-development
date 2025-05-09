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
            href="/admin/proyectos/tablero"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Volver a Proyectos
          </Link>
          <Link
            href={`/admin/proyectos/${params.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Editar Proyecto
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">{proyecto.nombre}</h2>
            <p className="text-gray-500">{proyecto.descripcion}</p>
          </div>
          {etapa && (
            <div
              className="px-3 py-1 text-white text-sm font-medium rounded-full shadow-sm"
              style={{ backgroundColor: etapa.color }}
            >
              {etapa.nombre}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Información del Cliente
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Nombre:</span> {proyecto.cliente_nombre}
              </p>
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Email:</span> {proyecto.cliente_email}
              </p>
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Teléfono:</span> {proyecto.cliente_telefono || "-"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Detalles del Proyecto
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Estado:</span>{" "}
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
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Fecha inicio:</span>{" "}
                {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString("es-ES") : "-"}
              </p>
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Fecha fin est.:</span>{" "}
                {proyecto.fecha_fin_estimada ? new Date(proyecto.fecha_fin_estimada).toLocaleDateString("es-ES") : "-"}
              </p>
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Presupuesto:</span>{" "}
                {proyecto.presupuesto_total ? formatCLP(proyecto.presupuesto_total) : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Progreso del Proyecto
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Completado</span>
              <span className="text-sm font-medium">{proyecto.porcentaje_completado}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${proyecto.porcentaje_completado}%` }}
              ></div>
            </div>
          </div>
        </div>

        {proyecto.cotizacion_id && (
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Cotización Asociada
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Cliente:</span> {proyecto.cotizacion_id.nombre}
              </p>
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Tipo espacio:</span> {proyecto.cotizacion_id.tipo_espacio}
              </p>
              <p className="mb-2 flex items-center">
                <span className="font-medium w-24">Metros²:</span> {proyecto.cotizacion_id.metros_cuadrados} m²
              </p>
              <div className="mt-3">
                <Link
                  href={`/admin/cotizaciones/${proyecto.cotizacion_id.id}`}
                  className="text-emerald-600 hover:text-emerald-800 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
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

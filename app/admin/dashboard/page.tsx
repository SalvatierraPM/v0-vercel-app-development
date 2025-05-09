import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin/AdminDashboard"

export default async function DashboardPage() {
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

  // Obtener estadísticas para el dashboard
  const { data: cotizacionesRecientes, error: cotizacionesError } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { count: totalCotizaciones } = await supabase.from("cotizaciones").select("*", { count: "exact", head: true })

  const { data: proyectos, error: proyectosError } = await supabase
    .from("proyectos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { count: totalProyectos } = await supabase.from("proyectos").select("*", { count: "exact", head: true })

  return (
    <AdminDashboard
      adminUser={adminUser}
      cotizacionesRecientes={cotizacionesRecientes || []}
      totalCotizaciones={totalCotizaciones || 0}
      proyectos={proyectos || []}
      totalProyectos={totalProyectos || 0}
    />
  )
}

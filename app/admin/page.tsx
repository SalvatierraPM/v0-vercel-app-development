import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminPanel from "@/components/AdminPanel"

export default async function AdminPage() {
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

  // Obtener cotizaciones
  const { data: cotizaciones } = await supabase
    .from("cotizaciones")
    .select(`
      *,
      archivos_cotizacion (*)
    `)
    .order("created_at", { ascending: false })

  return <AdminPanel cotizaciones={cotizaciones || []} />
}

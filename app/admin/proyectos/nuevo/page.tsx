import CrearProyectoForm from "@/components/admin/CrearProyectoForm"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function NuevoProyectoPage() {
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

  return <CrearProyectoForm />
}

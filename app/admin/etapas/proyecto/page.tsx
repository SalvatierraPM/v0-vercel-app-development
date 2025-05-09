import GestionEtapas from "@/components/admin/GestionEtapas"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function EtapasProyectoPage() {
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

  return <GestionEtapas tipo="proyecto" />
}

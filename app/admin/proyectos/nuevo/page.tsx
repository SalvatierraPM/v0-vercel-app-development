import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"
import { redirect } from "next/navigation"
import CrearProyectoForm from "@/components/admin/CrearProyectoForm"

export const dynamic = "force-dynamic"

export default async function NuevoProyectoPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Proyecto</h1>
      <CrearProyectoForm />
    </div>
  )
}

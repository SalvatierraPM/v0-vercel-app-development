import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CotizacionesList from "@/components/admin/CotizacionesList"

export default async function CotizacionesPage() {
  const supabase = createServerClient()

  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/admin/login")
  }

  // Obtener cotizaciones
  const { data: cotizaciones, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error al cargar cotizaciones:", error)
  }

  // Redirigir al tablero Kanban
  redirect("/admin/cotizaciones/tablero")

  // Este código no se ejecutará debido al redirect, pero lo dejamos por completitud
  return (
    <div className="p-6">
      <CotizacionesList cotizaciones={cotizaciones || []} />
    </div>
  )
}

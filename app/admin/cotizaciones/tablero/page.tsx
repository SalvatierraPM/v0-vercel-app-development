"use client"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CotizacionesTableroRealtime from "@/components/admin/CotizacionesTableroRealtime"
import FiltrosAvanzados from "@/components/admin/FiltrosAvanzados"
import ExportarCotizaciones from "@/components/admin/ExportarCotizaciones"
import EstadisticasCotizaciones from "@/components/admin/EstadisticasCotizaciones"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TableroPage() {
  const supabase = createServerClient()

  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/admin/login")
  }

  // Obtener cotizaciones para estadísticas y exportación
  const { data: cotizaciones, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al cargar cotizaciones:", error)
  }

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="tablero" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="tablero">Tablero Kanban</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <FiltrosAvanzados onFilterChange={() => {}} onReset={() => {}} />
            <ExportarCotizaciones cotizaciones={cotizaciones || []} />
          </div>
        </div>

        <TabsContent value="tablero" className="mt-0">
          <CotizacionesTableroRealtime />
        </TabsContent>

        <TabsContent value="estadisticas" className="mt-0">
          <EstadisticasCotizaciones cotizaciones={cotizaciones || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

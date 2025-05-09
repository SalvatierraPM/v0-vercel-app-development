"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus } from "lucide-react"
import CotizacionesList from "@/components/admin/CotizacionesList"

export default function CotizacionesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cargando, setCargando] = useState(true)
  const [sesionVerificada, setSesionVerificada] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function verificarSesion() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          router.push("/admin/login")
          return
        }

        setSesionVerificada(true)
      } catch (error) {
        console.error("Error verificando sesión:", error)
        router.push("/admin/login")
      } finally {
        setCargando(false)
      }
    }

    verificarSesion()
  }, [])

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!sesionVerificada) {
    return null // No renderizar nada mientras se redirige
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cotizaciones</h1>
        <Button onClick={() => router.push("/admin/cotizaciones/tablero")}>
          <Plus className="mr-2 h-4 w-4" />
          Ver Tablero Kanban
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <CotizacionesList />
        </CardContent>
      </Card>
    </div>
  )
}

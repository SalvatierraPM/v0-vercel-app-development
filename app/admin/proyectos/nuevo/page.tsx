"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import CrearProyectoForm from "@/components/admin/CrearProyectoForm"

export default function NuevoProyectoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [cargando, setCargando] = useState(true)
  const [sesionVerificada, setSesionVerificada] = useState(false)
  const supabase = createClient()
  const cotizacionId = searchParams.get("cotizacion")

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
        <h1 className="text-2xl font-bold">Crear Nuevo Proyecto</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <CrearProyectoForm cotizacionId={cotizacionId} />
        </CardContent>
      </Card>
    </div>
  )
}

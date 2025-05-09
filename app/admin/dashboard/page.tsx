"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Users, FileText, FolderOpen, Settings } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cargando, setCargando] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const [estadisticas, setEstadisticas] = useState({
    cotizaciones: 0,
    proyectos: 0,
    usuarios: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    async function cargarDatos() {
      try {
        // Verificar sesión
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !sessionData.session) {
          router.push("/admin/login")
          return
        }

        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData.user) {
          throw userError || new Error("No se pudo obtener información del usuario")
        }

        setUsuario(userData.user)

        // Cargar estadísticas
        const [cotizacionesResult, proyectosResult, usuariosResult] = await Promise.all([
          supabase.from("cotizaciones").select("id", { count: "exact" }),
          supabase.from("proyectos").select("id", { count: "exact" }),
          supabase.from("admin_users").select("id", { count: "exact" }),
        ])

        setEstadisticas({
          cotizaciones: cotizacionesResult.count || 0,
          proyectos: proyectosResult.count || 0,
          usuarios: usuariosResult.count || 0,
        })
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del dashboard",
          variant: "destructive",
        })
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.cotizaciones}</div>
            <p className="text-xs text-muted-foreground">Cotizaciones totales</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => router.push("/admin/cotizaciones")}
            >
              Ver cotizaciones
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.proyectos}</div>
            <p className="text-xs text-muted-foreground">Proyectos activos</p>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push("/admin/proyectos")}>
              Ver proyectos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.usuarios}</div>
            <p className="text-xs text-muted-foreground">Administradores</p>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push("/admin/usuarios")}>
              Gestionar usuarios
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Accede rápidamente a las funciones principales</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button onClick={() => router.push("/admin/cotizaciones/tablero")}>Ver tablero</Button>
            <Button onClick={() => router.push("/admin/proyectos/nuevo")}>Nuevo proyecto</Button>
            <Button variant="outline" onClick={() => router.push("/admin/configuracion")}>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Ver sitio web
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de usuario</CardTitle>
            <CardDescription>Tu información de acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">{usuario?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Último acceso</h3>
              <p className="text-sm text-muted-foreground">
                {usuario?.last_sign_in_at ? new Date(usuario.last_sign_in_at).toLocaleString("es-ES") : "No disponible"}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/admin/login")
              }}
            >
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

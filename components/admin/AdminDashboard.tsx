"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AdminSidebar from "./AdminSidebar"
import AdminHeader from "./AdminHeader"
import DashboardOverview from "./DashboardOverview"
import CotizacionesList from "./CotizacionesList"
import ProyectosList from "./ProyectosList"
import UsuariosList from "./UsuariosList"
import ConfiguracionPanel from "./ConfiguracionPanel"

interface AdminDashboardProps {
  adminUser: any
  cotizacionesRecientes: any[]
  totalCotizaciones: number
  proyectos: any[]
  totalProyectos: number
}

export default function AdminDashboard({
  adminUser,
  cotizacionesRecientes,
  totalCotizaciones,
  proyectos,
  totalProyectos,
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "cotizaciones" | "proyectos" | "usuarios" | "configuracion"
  >("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/admin/login"
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        adminUser={adminUser}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          adminUser={adminUser}
          handleLogout={handleLogout}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4">
          {activeSection === "dashboard" && (
            <DashboardOverview
              cotizacionesRecientes={cotizacionesRecientes}
              totalCotizaciones={totalCotizaciones}
              proyectos={proyectos}
              totalProyectos={totalProyectos}
            />
          )}

          {activeSection === "cotizaciones" && <CotizacionesList cotizaciones={cotizacionesRecientes} />}

          {activeSection === "proyectos" && <ProyectosList proyectos={proyectos} />}

          {activeSection === "usuarios" && <UsuariosList />}

          {activeSection === "configuracion" && <ConfiguracionPanel adminUser={adminUser} />}
        </main>
      </div>
    </div>
  )
}

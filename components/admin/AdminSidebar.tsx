"use client"

interface AdminSidebarProps {
  activeSection: "dashboard" | "cotizaciones" | "proyectos" | "usuarios" | "configuracion"
  setActiveSection: (section: "dashboard" | "cotizaciones" | "proyectos" | "usuarios" | "configuracion") => void
  isOpen: boolean
  adminUser: any
}

export default function AdminSidebar({ activeSection, setActiveSection, isOpen, adminUser }: AdminSidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "cotizaciones",
      label: "Cotizaciones",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "proyectos",
      label: "Proyectos",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      id: "configuracion",
      label: "Configuración",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  return (
    <aside
      className={`bg-emerald-800 text-white ${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 ease-in-out flex flex-col`}
    >
      <div className="p-4 flex items-center justify-center">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-800 font-bold">
          EW
        </div>
        {isOpen && <span className="ml-3 font-semibold text-xl">Estudio Well</span>}
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="mt-5 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex items-center px-4 py-3 mt-1 rounded-md transition-colors ${
                activeSection === item.id
                  ? "bg-emerald-700 text-white"
                  : "text-emerald-100 hover:bg-emerald-700 hover:text-white"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-emerald-700">
        {isOpen ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              {adminUser.nombre ? adminUser.nombre.charAt(0) : adminUser.email.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{adminUser.nombre || adminUser.email}</p>
              <p className="text-xs text-emerald-300">{adminUser.role || "Administrador"}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              {adminUser.nombre ? adminUser.nombre.charAt(0) : adminUser.email.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

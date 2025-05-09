"use client"

interface AdminHeaderProps {
  adminUser: any
  handleLogout: () => Promise<void>
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export default function AdminHeader({ adminUser, handleLogout, toggleSidebar, isSidebarOpen }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-800">Panel de Administración</h1>
      </div>

      <div className="flex items-center">
        <div className="relative">
          <button className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none">
            <span className="mr-2 text-sm">{adminUser.nombre || adminUser.email}</span>
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white">
              {adminUser.nombre ? adminUser.nombre.charAt(0) : adminUser.email.charAt(0)}
            </div>
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden">
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Perfil
            </a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Configuración
            </a>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-4 px-3 py-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
        >
          Salir
        </button>
      </div>
    </header>
  )
}

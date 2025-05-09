import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-6">
          !
        </div>

        <h1 className="text-2xl font-bold mb-4">Acceso no autorizado</h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder al panel de administración. Si crees que esto es un error, contacta al
          administrador del sistema.
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

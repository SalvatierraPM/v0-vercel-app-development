"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function ResetAdminPage() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [adminKey, setAdminKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setDebugInfo(null)

    try {
      // Verificar que la clave de administración sea correcta
      // Esta es una verificación simple - en producción deberías usar una clave más segura
      if (adminKey !== "estudio-well-admin-2023") {
        throw new Error("Clave de administración incorrecta")
      }

      setDebugInfo("Verificando si el usuario existe...")

      // Verificar si el usuario existe en admin_users
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single()

      if (adminError) {
        setDebugInfo(`Error al verificar usuario: ${adminError.message}`)
        throw new Error("No se encontró un usuario administrador con ese correo electrónico")
      }

      setDebugInfo("Usuario encontrado. Intentando restablecer contraseña...")

      // Usar la API de administración para actualizar la contraseña
      // Nota: Esto solo funcionará si tienes configurado correctamente el service_role_key
      const { error: resetError } = await supabase.auth.admin.updateUserById(adminUser.id, {
        password: newPassword,
      })

      if (resetError) {
        setDebugInfo(`Error al restablecer contraseña: ${resetError.message}`)
        throw resetError
      }

      setSuccess("Contraseña restablecida correctamente. Ahora puedes iniciar sesión con la nueva contraseña.")
    } catch (error: any) {
      console.error("Error completo:", error)
      setError(error.message || "Error al restablecer la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Link
        href="/"
        className="absolute top-4 left-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-none"
        title="Ir al inicio"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
            EW
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Restablecer Contraseña de Administrador</h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Esta página es solo para administradores del sistema. Se requiere una clave de administración.
              </p>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
        )}

        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
            <strong>Información de depuración:</strong>
            <pre className="mt-1 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email del administrador
            </label>
            <input
              type="email"
              id="email"
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
          </div>

          <div className="mb-6">
            <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-1">
              Clave de administración
            </label>
            <input
              type="password"
              id="adminKey"
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
          </button>

          <div className="mt-4 text-center">
            <Link href="/admin/login" className="text-sm text-emerald-600 hover:text-emerald-800">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [cargo, setCargo] = useState("")
  const [role, setRole] = useState("admin")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setDebugInfo(null)

    try {
      setDebugInfo("Iniciando registro de usuario en Auth...")

      // 1. Registrar el usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
        },
      })

      if (authError) {
        setDebugInfo(`Error en Auth: ${authError.message}`)
        throw authError
      }

      if (!authData.user) {
        setDebugInfo("No se recibió información del usuario después del registro")
        throw new Error("No se pudo crear el usuario. Por favor, intenta nuevamente.")
      }

      setDebugInfo(`Usuario creado con ID: ${authData.user.id}. Añadiendo a admin_users...`)

      // 2. Añadir el usuario a la tabla admin_users
      const { error: adminError } = await supabase.from("admin_users").insert({
        id: authData.user.id,
        email,
        role,
        nombre,
        cargo,
        activo: true,
      })

      if (adminError) {
        setDebugInfo(`Error al insertar en admin_users: ${adminError.message}`)
        throw adminError
      }

      setDebugInfo("Registro completado con éxito")
      setSuccess(
        "Administrador registrado correctamente. Revisa tu email para confirmar tu cuenta y luego inicia sesión.",
      )

      // Limpiar el formulario
      setEmail("")
      setPassword("")
      setNombre("")
      setCargo("")
      setRole("admin")
    } catch (error: any) {
      console.error("Error completo:", error)
      setError(error.message || "Error al registrar administrador")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
            EW
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Registrar Administrador</h1>

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

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
          </div>

          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              id="cargo"
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              id="role"
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="superadmin">Super Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrar Administrador"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/admin/login" className="text-sm text-emerald-600 hover:text-emerald-800">
            ¿Ya tienes una cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

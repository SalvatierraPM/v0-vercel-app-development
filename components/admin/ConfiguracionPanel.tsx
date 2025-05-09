"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface ConfiguracionPanelProps {
  adminUser: any
}

export default function ConfiguracionPanel({ adminUser }: ConfiguracionPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Implementar actualización de perfil
      setMessage({ type: "success", text: "Perfil actualizado correctamente" })
    } catch (error) {
      setMessage({ type: "error", text: "Error al actualizar el perfil" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Implementar cambio de contraseña
      setMessage({ type: "success", text: "Contraseña actualizada correctamente" })
    } catch (error) {
      setMessage({ type: "error", text: "Error al actualizar la contraseña" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Perfil de Administrador</h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                defaultValue={adminUser.nombre || ""}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                defaultValue={adminUser.email}
                disabled
                className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <input
                type="text"
                id="cargo"
                defaultValue={adminUser.cargo || ""}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                id="role"
                defaultValue={adminUser.role || "admin"}
                disabled={adminUser.role === "superadmin"}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="superadmin">Super Administrador</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Cambiar Contraseña</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual
              </label>
              <input
                type="password"
                id="current_password"
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div></div>

            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="new_password"
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirm_password"
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Configuración del Sistema</h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
              <span className="ml-2 text-sm text-gray-700">Enviar notificaciones por email</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
              <span className="ml-2 text-sm text-gray-700">Modo de mantenimiento</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4" />
              <span className="ml-2 text-sm text-gray-700">Registro de actividad</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

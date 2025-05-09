"use client"

import type React from "react"

import { useState } from "react"

export default function TestEmailPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus("Enviando correo de prueba...")

    try {
      const response = await fetch(`/api/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "test-id-123",
          email: email,
          nombre: "Usuario de Prueba",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("¡Correo enviado con éxito! Revisa tu bandeja de entrada.")
      } else {
        setStatus(`Error: ${data.error || data.warning || "Desconocido"}`)
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Prueba de Envío de Correo</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="tu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? "Enviando..." : "Enviar Correo de Prueba"}
          </button>
        </form>

        {status && (
          <div
            className={`mt-4 p-3 rounded ${status.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {status}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Esta página te permite probar si el sistema de envío de correos está funcionando correctamente.</p>
          <p className="mt-2">Si recibes un error, verifica:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Que la API key de Resend esté configurada correctamente</li>
            <li>Que las rutas API estén desplegadas correctamente</li>
            <li>Que no haya errores en los logs de Vercel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

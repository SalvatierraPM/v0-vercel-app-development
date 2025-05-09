"use client"

import type React from "react"

import { useState } from "react"

export default function TestEmailPage() {
  const [cotizacionId, setCotizacionId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Intentar con la nueva API
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cotizacionId }),
      })

      const data = await response.json()
      setResult(data)

      if (!data.success) {
        setError(data.error || data.warning || "Error desconocido al enviar el correo")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Prueba de envío de correo</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="cotizacionId" className="block text-sm font-medium text-gray-700 mb-1">
            ID de cotización
          </label>
          <input
            type="text"
            id="cotizacionId"
            value={cotizacionId}
            onChange={(e) => setCotizacionId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ingresa el ID de una cotización existente"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar correo de prueba"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
          <h3 className="font-medium">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
          <h3 className="font-medium mb-2">Resultado:</h3>
          <pre className="text-sm overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

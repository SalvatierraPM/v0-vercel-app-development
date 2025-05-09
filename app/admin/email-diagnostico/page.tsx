"use client"

import type React from "react"

import { useState } from "react"

export default function EmailDiagnostico() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)

  const handleTestResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/test-resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          apiKey: apiKey.trim() || undefined,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (!data.success) {
        setError(data.error || "Error desconocido al enviar el correo")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Envío de Correos</h1>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
        <h2 className="font-medium text-yellow-800">Información importante</h2>
        <p className="text-yellow-700 mt-1">
          Esta página te permite diagnosticar problemas con el envío de correos electrónicos. Puedes probar directamente
          con tu dirección de correo y opcionalmente usar una API key de Resend diferente.
        </p>
      </div>

      <form onSubmit={handleTestResend} className="mb-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico de prueba
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
          <p className="text-sm text-gray-500 mt-1">Ingresa tu dirección de correo para recibir un mensaje de prueba</p>
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key de Resend (opcional)
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="re_..."
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Si tienes una API key personal de Resend, puedes probarla aquí. Si dejas este campo vacío, se usará la API
            key configurada en el servidor.
          </p>
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

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Solución de problemas comunes</h2>

        <div className="bg-white border rounded-md p-4">
          <h3 className="font-medium mb-2">1. Verificar carpeta de spam</h3>
          <p>
            Los correos automáticos a menudo son filtrados como spam. Revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>

        <div className="bg-white border rounded-md p-4">
          <h3 className="font-medium mb-2">2. Verificar API key de Resend</h3>
          <p>
            Asegúrate de que la API key de Resend esté correctamente configurada en las variables de entorno del
            servidor.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Puedes obtener una API key gratuita en{" "}
            <a
              href="https://resend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              resend.com
            </a>
          </p>
        </div>

        <div className="bg-white border rounded-md p-4">
          <h3 className="font-medium mb-2">3. Configurar dominio personalizado</h3>
          <p>
            Para mejorar la entrega de correos, configura un dominio personalizado en Resend en lugar de usar el dominio
            predeterminado.
          </p>
        </div>

        <div className="bg-white border rounded-md p-4">
          <h3 className="font-medium mb-2">4. Alternativas a Resend</h3>
          <p>
            Si Resend no funciona para ti, considera usar servicios alternativos como SendGrid, Mailgun o Amazon SES.
          </p>
        </div>
      </div>
    </div>
  )
}

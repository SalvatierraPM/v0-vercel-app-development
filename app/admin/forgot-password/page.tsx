"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Usar nuestra nueva API en lugar de Supabase directamente
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada y carpeta de spam.",
        })
      } else {
        setMessage({
          type: "error",
          text: data.error || "Ha ocurrido un error al enviar el correo de recuperación.",
        })
      }
    } catch (error) {
      console.error("Error al solicitar recuperación de contraseña:", error)
      setMessage({
        type: "error",
        text: "Ha ocurrido un error al procesar tu solicitud. Por favor intenta nuevamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Link href="/" className="absolute left-4 top-4">
        <Button variant="ghost" size="icon" title="Ir a la página principal">
          <Home className="h-5 w-5" />
        </Button>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Recuperar contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo electrónico para recibir un enlace de recuperación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert
              className={`mb-4 ${message.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  placeholder="correo@ejemplo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm">
            <Link href="/admin/login" className="text-emerald-600 hover:text-emerald-800">
              Volver al inicio de sesión
            </Link>
          </div>
          <div className="text-center text-sm">
            <Link href="/admin/auth-help" className="text-gray-500 hover:text-gray-700">
              ¿Necesitas ayuda?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

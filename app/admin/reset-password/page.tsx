"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import { Home } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")

  useEffect(() => {
    // Verificar si el token es válido al cargar la página
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false)
        setMessage({
          type: "error",
          text: "Token de recuperación no proporcionado o inválido.",
        })
        return
      }

      try {
        const response = await fetch("/api/auth/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok && data.valid) {
          setIsTokenValid(true)
        } else {
          setIsTokenValid(false)
          setMessage({
            type: "error",
            text: data.error || "El enlace de recuperación es inválido o ha expirado.",
          })
        }
      } catch (error) {
        console.error("Error al verificar token:", error)
        setIsTokenValid(false)
        setMessage({
          type: "error",
          text: "Ha ocurrido un error al verificar el enlace de recuperación.",
        })
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Las contraseñas no coinciden.",
      })
      return
    }

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres.",
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Tu contraseña ha sido actualizada correctamente.",
        })

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/admin/login")
        }, 3000)
      } else {
        setMessage({
          type: "error",
          text: data.error || "Ha ocurrido un error al actualizar la contraseña.",
        })
      }
    } catch (error) {
      console.error("Error al restablecer contraseña:", error)
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
          <CardTitle className="text-center text-2xl">Restablecer contraseña</CardTitle>
          <CardDescription className="text-center">Crea una nueva contraseña para tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert
              className={`mb-4 ${message.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {isTokenValid === false ? (
            <div className="text-center py-4">
              <p className="mb-4">El enlace de recuperación es inválido o ha expirado.</p>
              <Button
                onClick={() => router.push("/admin/forgot-password")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Solicitar nuevo enlace
              </Button>
            </div>
          ) : isTokenValid === true ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="password"
                    placeholder="Nueva contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="confirmPassword"
                    placeholder="Confirmar contraseña"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <Link href="/admin/login" className="text-emerald-600 hover:text-emerald-800">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

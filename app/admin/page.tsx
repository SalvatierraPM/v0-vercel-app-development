"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir al dashboard de administración
    router.push("/admin/dashboard")
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Panel de Administración</h1>
      <p className="mt-4 text-xl">Cargando...</p>
    </main>
  )
}

import { createActionClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token no proporcionado" }, { status: 400 })
    }

    const supabase = createActionClient()

    // Verificar si el token existe y no ha expirado
    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      console.error("Error al verificar token:", error)
      return NextResponse.json({ valid: false, error: "Token inválido o expirado" }, { status: 400 })
    }

    return NextResponse.json({ valid: true, email: data.email })
  } catch (error) {
    console.error("Error al procesar solicitud:", error)
    return NextResponse.json({ valid: false, error: "Error al verificar token" }, { status: 500 })
  }
}

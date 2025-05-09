import { createActionClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña son requeridos" }, { status: 400 })
    }

    const supabase = createActionClient()

    // Verificar si el token existe y no ha expirado
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      console.error("Error al verificar token:", tokenError)
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    // Crear cliente de Supabase con la clave de servicio para actualizar la contraseña
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Actualizar la contraseña del usuario
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(tokenData.user_id, {
      password: password,
    })

    if (updateError) {
      console.error("Error al actualizar contraseña:", updateError)
      return NextResponse.json({ error: "Error al actualizar contraseña" }, { status: 500 })
    }

    // Marcar el token como usado
    await supabase.from("password_reset_tokens").update({ used: true }).eq("token", token)

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    })
  } catch (error) {
    console.error("Error al procesar solicitud:", error)
    return NextResponse.json(
      {
        error: "Error al actualizar contraseña",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

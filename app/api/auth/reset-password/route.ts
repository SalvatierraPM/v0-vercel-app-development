import { createActionClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar Resend solo si la API key está disponible
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// URL de la aplicación
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://estudio-well.vercel.app"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log(`Intentando enviar email de recuperación a: ${email}`)

    // Verificar si el usuario existe en admin_users
    const supabase = createActionClient()
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()

    if (adminError) {
      console.error("Error al verificar usuario en admin_users:", adminError)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Crear cliente de Supabase con la clave de servicio para buscar el usuario en Auth
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Buscar el usuario en Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
      filters: {
        email: email,
      },
    })

    if (userError || !userData.users.length) {
      console.error("Error al buscar usuario en Auth:", userError)
      return NextResponse.json({ error: "Usuario no encontrado en el sistema de autenticación" }, { status: 404 })
    }

    const userId = userData.users[0].id

    // Generar token de recuperación
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Almacenar el token en la base de datos con el user_id
    const { error: tokenError } = await supabase.from("password_reset_tokens").insert({
      email,
      token,
      user_id: userId,
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hora de validez
    })

    if (tokenError) {
      console.error("Error al almacenar token:", tokenError)
      return NextResponse.json({ error: "Error al generar token de recuperación" }, { status: 500 })
    }

    // Verificar si Resend está configurado
    if (!resend) {
      console.warn("Resend API key no configurada. No se enviará el email.")
      return NextResponse.json({
        success: false,
        warning: "Email no enviado: Resend no configurado",
      })
    }

    // Enviar email con Resend
    const resetUrl = `${appUrl}/admin/reset-password?token=${token}`
    const result = await resend.emails.send({
      from: "Estudio Well <onboarding@resend.dev>",
      to: email,
      subject: "Recuperación de contraseña - Estudio Well",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Recuperación de contraseña</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña para el panel de administración de Estudio Well.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
            </div>
            
            <p style="margin-top: 30px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>Este enlace expirará en 1 hora por seguridad.</p>
            
            <p>¡Gracias!</p>
          </div>
          <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Estudio Well. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    })

    console.log("Resultado del envío de email:", result)

    return NextResponse.json({
      success: true,
      message: "Se ha enviado un correo de recuperación a tu dirección de email",
    })
  } catch (error) {
    console.error("Error detallado al enviar email:", error)
    return NextResponse.json(
      {
        error: "Error al enviar email",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

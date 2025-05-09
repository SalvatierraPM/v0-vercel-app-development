import { NextResponse } from "next/server"
import { Resend } from "resend"

// URL de la aplicación
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://v0-vercel-app-development-irh6mf086-salvatierrapms-projects.vercel.app"

export async function GET(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      return NextResponse.json({ error: "API key no configurada" }, { status: 500 })
    }

    const resend = new Resend(resendApiKey)

    // Obtener el email de destino de los parámetros de consulta
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email no proporcionado" }, { status: 400 })
    }

    const result = await resend.emails.send({
      from: "Estudio Well <onboarding@resend.dev>",
      to: email,
      subject: "Prueba de email desde Estudio Well",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Prueba de email</h1>
          <p>Este es un email de prueba para verificar que Resend está funcionando correctamente.</p>
          <p>URL de la aplicación: ${appUrl}</p>
          <p>Fecha y hora: ${new Date().toLocaleString()}</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error al enviar email de prueba:", error)
    return NextResponse.json(
      {
        error: "Error al enviar email",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

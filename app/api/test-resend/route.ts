import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: Request) {
  try {
    const { email, apiKey } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email no proporcionado" }, { status: 400 })
    }

    // Usar la API key proporcionada o la del servidor
    const resendApiKey = apiKey || process.env.RESEND_API_KEY

    if (!resendApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API key de Resend no configurada",
          details:
            "No se encontró una API key de Resend. Configura la variable de entorno RESEND_API_KEY o proporciona una API key en la solicitud.",
        },
        { status: 400 },
      )
    }

    console.log(`Intentando enviar correo de prueba a ${email} con Resend`)

    // Inicializar Resend con la API key
    const resend = new Resend(resendApiKey)

    // Enviar correo de prueba
    const result = await resend.emails.send({
      from: "Estudio Well <onboarding@resend.dev>",
      to: email,
      subject: "Prueba de correo - Estudio Well",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Prueba de correo exitosa</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hola,</p>
            <p>Este es un correo de prueba enviado desde la aplicación de Estudio Well.</p>
            <p>Si estás recibiendo este correo, significa que la configuración de Resend está funcionando correctamente.</p>
            <p>Fecha y hora de envío: ${new Date().toLocaleString()}</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
          <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Estudio Well. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    })

    console.log("Resultado del envío de correo de prueba:", result)

    return NextResponse.json({
      success: true,
      result,
      message: "Correo de prueba enviado correctamente. Por favor revisa tu bandeja de entrada y carpeta de spam.",
    })
  } catch (error) {
    console.error("Error al enviar correo de prueba:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Error al enviar correo de prueba",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

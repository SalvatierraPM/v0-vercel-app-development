import { NextResponse } from "next/server"
import { Resend } from "resend"

// Inicializar Resend con la API key
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Email del estudio
const studioEmail = process.env.TEAM_EMAIL || "estudiowell.info@gmail.com"

export async function POST(request: Request) {
  try {
    const { nombre, email, telefono, asunto, mensaje } = await request.json()

    // Validar datos
    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ success: false, error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar si Resend está configurado
    if (!resend) {
      console.warn("Resend API key no configurada. No se enviará el email.")
      return NextResponse.json({
        success: false,
        warning: "Email no enviado: Resend no configurado",
      })
    }

    // 1. Enviar email al estudio
    const studioEmailResult = await resend.emails.send({
      from: "Formulario de Contacto <onboarding@resend.dev>",
      to: studioEmail,
      subject: `Nuevo mensaje de contacto: ${asunto || "Sin asunto"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #9A9065; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Nuevo mensaje de contacto</h1>
          </div>
          <div style="padding: 20px;">
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${telefono || "No proporcionado"}</p>
            <p><strong>Asunto:</strong> ${asunto || "Sin asunto"}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${mensaje}</p>
            
            <div style="margin-top: 30px; background-color: #f0ebd8; padding: 15px; border-radius: 5px;">
              <p style="margin: 0; color: #827753;">Este mensaje fue enviado desde el formulario de contacto de Estudio Well.</p>
            </div>
          </div>
        </div>
      `,
    })

    // 2. Enviar email de confirmación al cliente
    const clientEmailResult = await resend.emails.send({
      from: "Estudio Well <onboarding@resend.dev>",
      to: email,
      subject: "Hemos recibido tu mensaje - Estudio Well",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #9A9065; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Gracias por contactarnos</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hola ${nombre},</p>
            <p>Hemos recibido tu mensaje y te agradecemos por contactarnos.</p>
            <p>Nos pondremos en contacto contigo dentro de las próximas 48 horas para responder a tu consulta.</p>
            
            <div style="background-color: #f0ebd8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #827753;">Resumen de tu mensaje:</h3>
              <p><strong>Asunto:</strong> ${asunto || "Sin asunto"}</p>
              <p><strong>Mensaje:</strong> ${mensaje.substring(0, 150)}${mensaje.length > 150 ? "..." : ""}</p>
            </div>
            
            <p>Si tienes alguna pregunta adicional, no dudes en responder a este correo o llamarnos al +56 9 5866 5263.</p>
            
            <p>Saludos cordiales,</p>
            <p><strong>Equipo de Estudio Well</strong></p>
          </div>
          <div style="background-color: #555555; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Estudio Well. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      studioEmailResult,
      clientEmailResult,
    })
  } catch (error) {
    console.error("Error al enviar email:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al enviar email",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

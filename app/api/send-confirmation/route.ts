import { createActionClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextResponse } from "next/server"

// Inicializar Resend solo si la API key está disponible
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// URL de la aplicación
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://v0-vercel-app-development-irh6mf086-salvatierrapms-projects.vercel.app"

export async function POST(request: Request) {
  try {
    const { email, nombre, cotizacionId } = await request.json()

    console.log(`Intentando enviar email a: ${email} para cotización: ${cotizacionId}`)

    // Obtener datos de la cotización
    const supabase = createActionClient()
    const { data: cotizacion, error } = await supabase.from("cotizaciones").select("*").eq("id", cotizacionId).single()

    if (error) {
      console.error("Error al obtener cotización:", error)
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    // Verificar si Resend está configurado
    if (!resend) {
      console.warn("Resend API key no configurada. No se enviará el email.")
      return NextResponse.json({
        success: false,
        warning: "Email no enviado: Resend no configurado",
      })
    }

    console.log(
      "Enviando email con Resend usando API key:",
      resendApiKey ? `${resendApiKey.substring(0, 5)}...` : "No disponible",
    )

    // Enviar email
    const result = await resend.emails.send({
      from: "Estudio Well <onboarding@resend.dev>",
      to: email,
      subject: "Tu cotización de Estudio Well",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">¡Gracias por tu cotización!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hola ${nombre},</p>
            <p>Hemos recibido tu solicitud de cotización para tu proyecto de diseño de interiores. Aquí está un resumen de tu cotización:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalles del proyecto:</h3>
              <ul style="padding-left: 20px;">
                <li>Tipo de espacio: ${cotizacion.tipo_espacio}</li>
                <li>Metros cuadrados: ${cotizacion.metros_cuadrados} m²</li>
                <li>Alcance: ${cotizacion.alcance.replace("_", " ")}</li>
                <li>Rango de inversión: ${cotizacion.cotizacion_uf_min} - ${cotizacion.cotizacion_uf_max} UF</li>
              </ul>
            </div>
            
            <p>Uno de nuestros diseñadores se pondrá en contacto contigo en las próximas 24 horas para discutir los detalles de tu proyecto.</p>
            
            <p>Si tienes alguna pregunta, no dudes en responder a este correo o llamarnos al +56 9 1234 5678.</p>
            
            <p>¡Gracias por confiar en Estudio Well!</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${appUrl}/cotizacion/${cotizacionId}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver mi cotización</a>
            </div>
          </div>
          <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Estudio Well. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    })

    console.log("Resultado del envío de email:", result)

    return NextResponse.json({ success: true, result })
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

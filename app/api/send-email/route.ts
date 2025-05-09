import { createActionClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextResponse } from "next/server"

// Inicializar Resend con la API key
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// URL de la aplicación
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://estudio-well.vercel.app"

// Email de notificación para el equipo (usar el mismo email del usuario por ahora)
const teamEmail = process.env.TEAM_EMAIL || "tu-email@ejemplo.com" // Reemplazar con el email real

export async function POST(request: Request) {
  try {
    const { cotizacionId } = await request.json()

    if (!cotizacionId) {
      return NextResponse.json({ error: "ID de cotización no proporcionado" }, { status: 400 })
    }

    console.log(`Procesando envío de email para cotización: ${cotizacionId}`)

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

    console.log(`Enviando email a ${cotizacion.email} para cotización ${cotizacionId}`)

    // 1. Enviar email al cliente
    const clientResult = await resend.emails.send({
      from: "Estudio Well <onboarding@resend.dev>",
      to: cotizacion.email,
      subject: "Tu cotización de Estudio Well",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">¡Gracias por tu cotización!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hola ${cotizacion.nombre},</p>
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

    console.log("Resultado del envío de email al cliente:", clientResult)

    // 2. Enviar email de notificación al equipo
    const teamResult = await resend.emails.send({
      from: "Notificaciones Estudio Well <onboarding@resend.dev>",
      to: teamEmail,
      subject: `¡Nueva cotización! - ${cotizacion.nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">¡Nueva cotización recibida!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Se ha recibido una nueva solicitud de cotización con los siguientes detalles:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Información del cliente:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Nombre:</td>
                  <td style="padding: 8px 0;">${cotizacion.nombre}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;">${cotizacion.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Teléfono:</td>
                  <td style="padding: 8px 0;">${cotizacion.telefono || "No proporcionado"}</td>
                </tr>
              </table>
              
              <h3 style="margin-top: 20px; color: #1e40af;">Detalles del proyecto:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Tipo de espacio:</td>
                  <td style="padding: 8px 0;">${cotizacion.tipo_espacio}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Metros cuadrados:</td>
                  <td style="padding: 8px 0;">${cotizacion.metros_cuadrados} m²</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Estado actual:</td>
                  <td style="padding: 8px 0;">${cotizacion.estado}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Alcance:</td>
                  <td style="padding: 8px 0;">${cotizacion.alcance.replace("_", " ")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Urgencia:</td>
                  <td style="padding: 8px 0;">${cotizacion.urgencia}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Presupuesto:</td>
                  <td style="padding: 8px 0;">${cotizacion.presupuesto || "No especificado"}</td>
                </tr>
              </table>
              
              <h3 style="margin-top: 20px; color: #1e40af;">Cotización estimada:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Rango en UF:</td>
                  <td style="padding: 8px 0;">${cotizacion.cotizacion_uf_min} - ${cotizacion.cotizacion_uf_max} UF</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Rango en CLP:</td>
                  <td style="padding: 8px 0;">$${cotizacion.cotizacion_clp_min.toLocaleString("es-CL")} - $${cotizacion.cotizacion_clp_max.toLocaleString("es-CL")}</td>
                </tr>
              </table>
            </div>
            
            <p>Fecha de recepción: ${new Date(cotizacion.created_at).toLocaleString("es-CL")}</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${appUrl}/admin/cotizaciones" style="background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Ver en el panel</a>
              <a href="https://calendly.com/estudio-well/reunion-inicial" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Agendar reunión en Calendly</a>
            </div>
          </div>
          <div style="background-color: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Estudio Well. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    })

    console.log("Resultado del envío de email al equipo:", teamResult)

    return NextResponse.json({ success: true, clientResult, teamResult })
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

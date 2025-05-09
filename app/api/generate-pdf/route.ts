import { createActionClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID de cotización requerido" }, { status: 400 })
    }

    // Obtener datos de la cotización
    const supabase = createActionClient()
    const { data: cotizacion, error } = await supabase.from("cotizaciones").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    // Devolver los datos de la cotización para generar el PDF en el cliente
    return NextResponse.json({
      success: true,
      cotizacion,
    })
  } catch (error) {
    console.error("Error detallado al obtener datos para PDF:", error)
    return NextResponse.json(
      {
        error: "Error al obtener datos para PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

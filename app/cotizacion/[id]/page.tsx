import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import EstimateBox from "@/components/EstimateBox"
import Link from "next/link"

export default async function CotizacionPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Obtener datos de la cotización
  const { data: cotizacion, error } = await supabase.from("cotizaciones").select("*").eq("id", params.id).single()

  if (error || !cotizacion) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-emerald-600 hover:text-emerald-800">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold text-center">Tu cotización</h1>
        <div className="w-24"></div> {/* Espaciador para centrar el título */}
      </div>

      <div className="max-w-2xl mx-auto">
        <EstimateBox
          ufMin={cotizacion.cotizacion_uf_min}
          ufMax={cotizacion.cotizacion_uf_max}
          clpMin={cotizacion.cotizacion_clp_min}
          clpMax={cotizacion.cotizacion_clp_max}
          formData={{
            tipo_espacio: cotizacion.tipo_espacio,
            metros_cuadrados: cotizacion.metros_cuadrados,
            estado: cotizacion.estado,
            alcance: cotizacion.alcance,
            urgencia: cotizacion.urgencia,
          }}
          cotizacionId={cotizacion.id}
        />
      </div>
    </div>
  )
}

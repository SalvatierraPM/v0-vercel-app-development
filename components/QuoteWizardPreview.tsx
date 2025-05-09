"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import EstimateBox from "./EstimateBox"
import { FileText, Download, ArrowLeft, Loader2 } from "lucide-react"

interface QuoteWizardPreviewProps {
  estimate?: {
    ufMin: number
    ufMax: number
    clpMin: number
    clpMax: number
    formData: {
      tipo_espacio: string
      metros_cuadrados: number
      estado: string
      alcance: string
      urgencia: string
      presupuesto?: string
      nombre: string
      email: string
      telefono?: string
    }
  }
  cotizacionId?: string
}

export default function QuoteWizardPreview({ estimate, cotizacionId }: QuoteWizardPreviewProps = {}) {
  const router = useRouter()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Datos de ejemplo para la vista previa
  const sampleEstimate = {
    ufMin: 150,
    ufMax: 250,
    clpMin: 5250000,
    clpMax: 8750000,
    formData: {
      tipo_espacio: "cafetería",
      metros_cuadrados: 85,
      estado: "remodelación",
      alcance: "solo_diseño",
      urgencia: "1-3 meses",
      nombre: "Cliente Ejemplo",
      email: "cliente@ejemplo.com",
      telefono: "+56 9 1234 5678",
    },
  }

  // Usar datos de ejemplo si no se proporcionan props
  const displayEstimate = estimate || sampleEstimate
  const displayCotizacionId = cotizacionId || "preview-123456"

  const handleGeneratePdf = async () => {
    // Si estamos en modo vista previa sin ID real, mostrar mensaje
    if (!cotizacionId) {
      setPdfError("Esta es una vista previa. No se puede generar PDF sin una cotización real.")
      return
    }

    setIsGeneratingPdf(true)
    setPdfError(null)

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cotizacionId: displayCotizacionId,
          estimate: displayEstimate,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error al generar PDF: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setPdfUrl(data.url)
    } catch (error) {
      console.error("Error al generar PDF:", error)
      setPdfError(error instanceof Error ? error.message : "Error desconocido al generar PDF")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!cotizacionId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center">
          <div className="bg-amber-100 rounded-full p-2 mr-3">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-amber-800">Modo vista previa</h3>
            <p className="text-amber-700 text-sm">
              Esta es una vista previa de cómo se verá la página de cotización completada. Los datos mostrados son de
              ejemplo.
            </p>
          </div>
        </div>
      )}

      <EstimateBox
        ufMin={displayEstimate.ufMin}
        ufMax={displayEstimate.ufMax}
        clpMin={displayEstimate.clpMin}
        clpMax={displayEstimate.clpMax}
        formData={displayEstimate.formData}
        cotizacionId={displayCotizacionId}
      />

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {cotizacionId && (
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar cotización (PDF)
              </>
            )}
          </button>
        )}
      </div>

      {pdfError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{pdfError}</div>
      )}

      {pdfUrl && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium mb-2">¡PDF generado correctamente!</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-green-600 hover:text-green-800 font-medium"
          >
            <FileText className="w-4 h-4 mr-1" />
            Ver o descargar PDF
          </a>
        </div>
      )}
    </div>
  )
}

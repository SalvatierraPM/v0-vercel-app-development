"use client"

import { useState } from "react"
import QuoteWizard from "@/components/QuoteWizard"
import EstimateBox from "@/components/EstimateBox"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function QuotePage() {
  const [showResults, setShowResults] = useState(false)
  const [estimateData, setEstimateData] = useState<{
    ufMin: number
    ufMax: number
    clpMin: number
    clpMax: number
    formData: any
    cotizacionId: string
  } | null>(null)

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Volver al inicio</span>
        </Link>
        <h1 className="text-3xl font-bold text-center">Cotiza tu proyecto</h1>
        <div className="w-24"></div> {/* Espaciador para centrar el título */}
      </div>

      {!showResults ? (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <QuoteWizard
            onComplete={(data, estimate, cotizacionId) => {
              setEstimateData({ ...estimate, cotizacionId })
              setShowResults(true)
            }}
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {estimateData && (
            <EstimateBox
              ufMin={estimateData.ufMin}
              ufMax={estimateData.ufMax}
              clpMin={estimateData.clpMin}
              clpMax={estimateData.clpMax}
              formData={estimateData.formData}
              cotizacionId={estimateData.cotizacionId}
            />
          )}
        </div>
      )}
    </div>
  )
}

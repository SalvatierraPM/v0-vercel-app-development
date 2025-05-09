"use client"

import QuoteWizardPreview from "@/components/QuoteWizardPreview"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function QuotePreviewPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Volver al inicio</span>
        </Link>
        <h1 className="text-3xl font-bold text-center">Vista previa de cotización</h1>
        <div className="w-24"></div> {/* Espaciador para centrar el título */}
      </div>

      {/* No pasamos props para que use los datos de ejemplo */}
      <QuoteWizardPreview />
    </div>
  )
}

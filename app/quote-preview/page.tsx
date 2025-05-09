"use client"

import QuoteWizardPreview from "@/components/QuoteWizardPreview"
import Link from "next/link"

export default function QuotePreviewPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-emerald-600 hover:text-emerald-800">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold text-center">Cotiza tu proyecto</h1>
        <div className="w-24"></div> {/* Espaciador para centrar el título */}
      </div>

      <QuoteWizardPreview />
    </div>
  )
}

"use client"

import { useState } from "react"

export default function DemoPage() {
  const [currentView, setCurrentView] = useState<"landing" | "quote" | "admin">("landing")

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold mb-4">Demo de Estudio Well - App de Cotización</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView("landing")}
            className={`px-4 py-2 rounded ${currentView === "landing" ? "bg-emerald-600 text-white" : "bg-gray-200"}`}
          >
            Landing Page
          </button>
          <button
            onClick={() => setCurrentView("quote")}
            className={`px-4 py-2 rounded ${currentView === "quote" ? "bg-emerald-600 text-white" : "bg-gray-200"}`}
          >
            Formulario de Cotización
          </button>
          <button
            onClick={() => setCurrentView("admin")}
            className={`px-4 py-2 rounded ${currentView === "admin" ? "bg-emerald-600 text-white" : "bg-gray-200"}`}
          >
            Panel Admin
          </button>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4">
        {currentView === "landing" && <iframe src="/" className="w-full h-[600px] border-0" />}
        {currentView === "quote" && <iframe src="/quote-preview" className="w-full h-[600px] border-0" />}
        {currentView === "admin" && <iframe src="/admin-preview" className="w-full h-[600px] border-0" />}
      </div>
    </div>
  )
}

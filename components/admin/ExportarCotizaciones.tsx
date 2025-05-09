"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Loader2 } from "lucide-react"
import { formatUF, formatCLP } from "@/lib/utils"

interface ExportarCotizacionesProps {
  cotizaciones: any[]
  filteredCotizaciones?: any[]
}

export default function ExportarCotizaciones({ cotizaciones, filteredCotizaciones }: ExportarCotizacionesProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const dataToExport = filteredCotizaciones || cotizaciones

      // Preparar los datos para CSV
      const headers = [
        "Fecha",
        "Nombre",
        "Email",
        "Teléfono",
        "Tipo de Espacio",
        "Metros Cuadrados",
        "Cotización UF (Min)",
        "Cotización UF (Max)",
        "Cotización CLP (Min)",
        "Cotización CLP (Max)",
        "Estado",
        "Alcance",
        "Urgencia",
        "Etapa",
      ]

      const rows = dataToExport.map((c) => [
        new Date(c.created_at).toLocaleDateString("es-CL"),
        c.nombre,
        c.email,
        c.telefono || "",
        c.tipo_espacio,
        c.metros_cuadrados,
        formatUF(c.cotizacion_uf_min),
        formatUF(c.cotizacion_uf_max),
        formatCLP(c.cotizacion_clp_min),
        formatCLP(c.cotizacion_clp_max),
        c.estado || "pendiente",
        c.alcance || "",
        c.urgencia || "",
        c.etapa_id || "Sin clasificar",
      ])

      // Crear el contenido CSV
      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

      // Crear un blob y descargar
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `cotizaciones_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error al exportar cotizaciones:", error)
      alert("Error al exportar cotizaciones. Por favor, intenta de nuevo.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || cotizaciones.length === 0}
      className="flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Exportando...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet size={16} />
          <span>Exportar CSV</span>
        </>
      )}
    </Button>
  )
}

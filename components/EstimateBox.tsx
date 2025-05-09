"use client"

import { formatCLP, formatUF } from "@/lib/utils"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface EstimateBoxProps {
  ufMin: number
  ufMax: number
  clpMin: number
  clpMax: number
  formData: any
  cotizacionId: string
}

export default function EstimateBox({ ufMin, ufMax, clpMin, clpMax, formData, cotizacionId }: EstimateBoxProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const pdfContentRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      if (!pdfContentRef.current) {
        throw new Error("No se pudo generar el PDF: elemento no encontrado")
      }

      // Crear una copia del contenido para el PDF con estilos específicos
      const pdfContent = pdfContentRef.current.cloneNode(true) as HTMLElement
      pdfContent.style.padding = "20px"
      pdfContent.style.backgroundColor = "white"
      pdfContent.style.width = "800px"

      // Añadir encabezado
      const header = document.createElement("div")
      header.style.backgroundColor = "#059669"
      header.style.color = "white"
      header.style.padding = "20px"
      header.style.textAlign = "center"
      header.style.marginBottom = "20px"
      header.innerHTML = `
        <h1 style="margin: 0; font-size: 24px;">Cotización - Estudio Well</h1>
        <p style="margin-top: 5px;">Diseño de interiores que transforma espacios</p>
      `
      pdfContent.prepend(header)

      // Añadir pie de página
      const footer = document.createElement("div")
      footer.style.marginTop = "30px"
      footer.style.textAlign = "center"
      footer.style.fontSize = "12px"
      footer.style.color = "#666"
      footer.innerHTML = `
        <p>© ${new Date().getFullYear()} Estudio Well. Todos los derechos reservados.</p>
        <p>Cotización generada el ${new Date().toLocaleDateString("es-ES")}</p>
      `
      pdfContent.appendChild(footer)

      // Crear un contenedor temporal para renderizar el PDF
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "-9999px"
      tempContainer.appendChild(pdfContent)
      document.body.appendChild(tempContainer)

      // Generar canvas desde el HTML
      const canvas = await html2canvas(pdfContent, {
        scale: 1.5, // Mayor calidad
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Eliminar el contenedor temporal
      document.body.removeChild(tempContainer)

      // Crear PDF
      const imgData = canvas.toDataURL("image/jpeg", 1.0)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`cotizacion-${cotizacionId}.pdf`)
    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Hubo un error al generar el PDF. Por favor intenta nuevamente.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-emerald-600 text-white p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Tu cotización está lista</h2>
          <p className="text-emerald-100">Basado en tus requerimientos, hemos preparado la siguiente estimación</p>
        </div>

        <div className="p-6" ref={pdfContentRef}>
          <div className="mb-8 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Rango de inversión estimado</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-emerald-700 mb-1">UF</p>
                <p className="text-3xl font-bold text-emerald-800">
                  {formatUF(ufMin)} - {formatUF(ufMax)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">CLP (aproximado)</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCLP(clpMin)} - {formatCLP(clpMax)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Detalles del proyecto</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex justify-between">
                  <span>Tipo de espacio:</span>
                  <span className="font-medium capitalize">{formData.tipo_espacio}</span>
                </li>
                <li className="flex justify-between">
                  <span>Metros cuadrados:</span>
                  <span className="font-medium">{formData.metros_cuadrados} m²</span>
                </li>
                <li className="flex justify-between">
                  <span>Estado actual:</span>
                  <span className="font-medium capitalize">{formData.estado.replace("_", " ")}</span>
                </li>
                <li className="flex justify-between">
                  <span>Alcance:</span>
                  <span className="font-medium capitalize">{formData.alcance.replace("_", " ")}</span>
                </li>
                <li className="flex justify-between">
                  <span>Urgencia:</span>
                  <span className="font-medium">{formData.urgencia}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">¿Qué incluye?</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-emerald-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Asesoría personalizada</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-emerald-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Planos y diseños detallados</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-emerald-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Visualizaciones 3D</span>
                </li>
                {formData.alcance === "llave_en_mano" && (
                  <>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-emerald-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Gestión de proveedores</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-emerald-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Supervisión de obra</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center p-6 pt-0">
          <a
            href="https://calendly.com/estudiowelldesign/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors text-center"
          >
            Agenda una reunión
          </a>
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? "Generando..." : "Descargar PDF"}
          </button>
        </div>
      </div>
    </>
  )
}

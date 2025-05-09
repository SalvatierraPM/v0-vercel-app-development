"use client"

import { useState } from "react"
import Link from "next/link"
import { formatCLP, formatUF } from "@/lib/utils"
import { Calendar, Clock, FileText, Mail, MessageSquare, Phone, Palette, Home, Layers } from "lucide-react"

interface EstimateBoxProps {
  ufMin: number
  ufMax: number
  clpMin: number
  clpMax: number
  formData?: any
  cotizacionId?: string
}

export default function EstimateBox({ ufMin, ufMax, clpMin, clpMax, formData, cotizacionId }: EstimateBoxProps) {
  const [activeTab, setActiveTab] = useState<"resumen" | "detalles" | "pasos">("resumen")
  const [whatsappOpen, setWhatsappOpen] = useState(false)

  // Formatear el número de teléfono para WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return ""
    // Eliminar espacios, paréntesis, guiones y el prefijo +56
    return phone.replace(/\s+/g, "").replace(/[()-]/g, "").replace(/^\+56/, "")
  }

  // Generar mensaje para WhatsApp
  const generateWhatsAppMessage = () => {
    const tipoServicio = formData?.tipo_servicio || "diseno_interiores"
    let servicioText = ""

    switch (tipoServicio) {
      case "diseno_interiores":
        servicioText = "diseño de interiores"
        break
      case "branding":
        servicioText = "branding"
        break
      case "ambos":
        servicioText = "diseño de interiores y branding"
        break
      default:
        servicioText = "diseño"
    }

    const baseMessage = `Hola, acabo de solicitar una cotización en Estudio Well para ${servicioText} (ID: ${cotizacionId}). Me gustaría coordinar los siguientes pasos para mi proyecto.`
    return encodeURIComponent(baseMessage)
  }

  // Abrir WhatsApp
  const openWhatsApp = () => {
    if (!formData?.telefono) {
      setWhatsappOpen(true)
      return
    }

    const phone = formatPhoneForWhatsApp(formData.telefono)
    const message = generateWhatsAppMessage()
    window.open(`https://wa.me/56${phone}?text=${message}`, "_blank")
  }

  // Formatear tipo de espacio
  const formatTipoEspacio = (tipo: string) => {
    if (!tipo) return ""
    const tipos: Record<string, string> = {
      restaurante: "Restaurante",
      café: "Café",
      showroom: "Showroom",
      hotel: "Hotel",
      otro: "Otro",
    }
    return tipos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1)
  }

  // Formatear estado
  const formatEstado = (estado: string) => {
    if (!estado) return ""
    const estados: Record<string, string> = {
      obra_gruesa: "Obra gruesa",
      remodelación: "Remodelación",
      deco: "Decoración",
    }
    return estados[estado] || estado
  }

  // Formatear alcance
  const formatAlcance = (alcance: string) => {
    if (!alcance) return ""
    const alcances: Record<string, string> = {
      solo_diseño: "Solo diseño",
      llave_en_mano: "Llave en mano (diseño + ejecución)",
    }
    return alcances[alcance] || alcance
  }

  // Formatear tipo de branding
  const formatTipoBranding = (tipo: string) => {
    if (!tipo) return ""
    const tipos: Record<string, string> = {
      logo: "Solo logo",
      identidad_completa: "Identidad completa",
      rebranding: "Rebranding",
      otro: "Otro",
    }
    return tipos[tipo] || tipo
  }

  // Obtener icono para tipo de servicio
  const getTipoServicioIcon = (tipo: string) => {
    switch (tipo) {
      case "diseno_interiores":
        return <Home className="w-5 h-5 mr-2 text-[#9A9065]" />
      case "branding":
        return <Palette className="w-5 h-5 mr-2 text-[#9A9065]" />
      case "ambos":
        return <Layers className="w-5 h-5 mr-2 text-[#9A9065]" />
      default:
        return <Home className="w-5 h-5 mr-2 text-[#9A9065]" />
    }
  }

  // Obtener icono para tipo de espacio
  const getTipoEspacioIcon = (tipo: string) => {
    switch (tipo) {
      case "restaurante":
        return "🍽️"
      case "café":
        return "☕"
      case "showroom":
        return "🏪"
      case "hotel":
        return "🏨"
      default:
        return "🏢"
    }
  }

  // Obtener icono para estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "obra_gruesa":
        return "🏗️"
      case "remodelación":
        return "🔨"
      case "deco":
        return "🎨"
      default:
        return "🏠"
    }
  }

  // Obtener icono para alcance
  const getAlcanceIcon = (alcance: string) => {
    switch (alcance) {
      case "solo_diseño":
        return "📐"
      case "llave_en_mano":
        return "🔑"
      default:
        return "📋"
    }
  }

  // Obtener icono para urgencia
  const getUrgenciaIcon = (urgencia: string) => {
    switch (urgencia) {
      case "<1 mes":
        return "🔥"
      case "1-3 meses":
        return "⏱️"
      case ">3 meses":
        return "📅"
      default:
        return "⏰"
    }
  }

  // Obtener icono para tipo de branding
  const getTipoBrandingIcon = (tipo: string) => {
    switch (tipo) {
      case "logo":
        return "🔤"
      case "identidad_completa":
        return "🎨"
      case "rebranding":
        return "🔄"
      default:
        return "✏️"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-fade-in">
      {/* Encabezado con estimación de costos */}
      <div className="bg-gradient-to-r from-[#9A9065] to-[#827753] p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Estimación de costos</h2>
        <p className="text-[#F0EBD8] mb-4">
          {formData?.tipo_servicio === "branding"
            ? "Basada en los detalles proporcionados para tu proyecto de branding"
            : formData?.tipo_servicio === "ambos"
              ? "Basada en los detalles proporcionados para tu proyecto de diseño interior y branding"
              : `Basada en los detalles proporcionados para tu proyecto de ${formData ? formatTipoEspacio(formData.tipo_espacio) : "diseño interior"}`}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm font-medium text-[#F0EBD8] mb-1">Rango en UF</p>
            <p className="text-3xl font-bold">
              UF {formatUF(ufMin)} - {formatUF(ufMax)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm font-medium text-[#F0EBD8] mb-1">Rango en CLP</p>
            <p className="text-3xl font-bold">
              {formatCLP(clpMin)} - {formatCLP(clpMax)}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === "resumen"
              ? "text-[#9A9065] border-b-2 border-[#9A9065]"
              : "text-gray-500 hover:text-[#9A9065]"
          }`}
          onClick={() => setActiveTab("resumen")}
        >
          Resumen
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === "detalles"
              ? "text-[#9A9065] border-b-2 border-[#9A9065]"
              : "text-gray-500 hover:text-[#9A9065]"
          }`}
          onClick={() => setActiveTab("detalles")}
        >
          Detalles
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === "pasos" ? "text-[#9A9065] border-b-2 border-[#9A9065]" : "text-gray-500 hover:text-[#9A9065]"
          }`}
          onClick={() => setActiveTab("pasos")}
        >
          Siguientes pasos
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {/* Pestaña de Resumen */}
        {activeTab === "resumen" && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Tarjeta de resumen del proyecto */}
              <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#9A9065]" />
                  Resumen del proyecto
                </h3>
                <ul className="space-y-3">
                  {formData && (
                    <>
                      <li className="flex items-center">
                        <div className="mr-2">{getTipoServicioIcon(formData.tipo_servicio || "diseno_interiores")}</div>
                        <div>
                          <p className="text-sm text-gray-500">Tipo de servicio</p>
                          <p className="font-medium">
                            {formData.tipo_servicio === "diseno_interiores"
                              ? "Diseño de interiores"
                              : formData.tipo_servicio === "branding"
                                ? "Branding"
                                : "Diseño de interiores y Branding"}
                          </p>
                        </div>
                      </li>

                      {(formData.tipo_servicio === "diseno_interiores" || formData.tipo_servicio === "ambos") && (
                        <>
                          <li className="flex items-center">
                            <span className="text-xl mr-2">{getTipoEspacioIcon(formData.tipo_espacio)}</span>
                            <div>
                              <p className="text-sm text-gray-500">Tipo de espacio</p>
                              <p className="font-medium">{formatTipoEspacio(formData.tipo_espacio)}</p>
                            </div>
                          </li>
                          <li className="flex items-center">
                            <span className="text-xl mr-2">📏</span>
                            <div>
                              <p className="text-sm text-gray-500">Metros cuadrados</p>
                              <p className="font-medium">{formData.metros_cuadrados} m²</p>
                            </div>
                          </li>
                          <li className="flex items-center">
                            <span className="text-xl mr-2">{getEstadoIcon(formData.estado)}</span>
                            <div>
                              <p className="text-sm text-gray-500">Estado actual</p>
                              <p className="font-medium">{formatEstado(formData.estado)}</p>
                            </div>
                          </li>
                          <li className="flex items-center">
                            <span className="text-xl mr-2">{getAlcanceIcon(formData.alcance)}</span>
                            <div>
                              <p className="text-sm text-gray-500">Alcance</p>
                              <p className="font-medium">{formatAlcance(formData.alcance)}</p>
                            </div>
                          </li>
                        </>
                      )}

                      {(formData.tipo_servicio === "branding" || formData.tipo_servicio === "ambos") && (
                        <>
                          <li className="flex items-center">
                            <span className="text-xl mr-2">{getTipoBrandingIcon(formData.tipo_branding)}</span>
                            <div>
                              <p className="text-sm text-gray-500">Tipo de branding</p>
                              <p className="font-medium">{formatTipoBranding(formData.tipo_branding)}</p>
                            </div>
                          </li>
                          {formData.industria && (
                            <li className="flex items-center">
                              <span className="text-xl mr-2">🏭</span>
                              <div>
                                <p className="text-sm text-gray-500">Industria</p>
                                <p className="font-medium">{formData.industria}</p>
                              </div>
                            </li>
                          )}
                        </>
                      )}

                      <li className="flex items-center">
                        <span className="text-xl mr-2">{getUrgenciaIcon(formData.urgencia)}</span>
                        <div>
                          <p className="text-sm text-gray-500">Urgencia</p>
                          <p className="font-medium">{formData.urgencia}</p>
                        </div>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Tarjeta de próximos pasos */}
              <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-[#9A9065]" />
                  Próximos pasos
                </h3>
                <ol className="space-y-3 relative before:absolute before:left-[15px] before:top-1 before:h-[calc(100%-10px)] before:w-[1px] before:bg-gray-200">
                  <li className="flex pl-8 relative">
                    <span className="absolute left-0 top-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#F0EBD8] text-[#9A9065] font-bold text-sm">
                      1
                    </span>
                    <p>Revisaremos tu solicitud y prepararemos una propuesta detallada.</p>
                  </li>
                  <li className="flex pl-8 relative">
                    <span className="absolute left-0 top-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#F0EBD8] text-[#9A9065] font-bold text-sm">
                      2
                    </span>
                    <p>Te contactaremos dentro de las próximas 24-48 horas.</p>
                  </li>
                  <li className="flex pl-8 relative">
                    <span className="absolute left-0 top-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#F0EBD8] text-[#9A9065] font-bold text-sm">
                      3
                    </span>
                    <p>Coordinaremos una reunión para entender mejor tus necesidades.</p>
                  </li>
                  <li className="flex pl-8 relative">
                    <span className="absolute left-0 top-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#F0EBD8] text-[#9A9065] font-bold text-sm">
                      4
                    </span>
                    <p>Desarrollaremos un plan de trabajo y cronograma para tu proyecto.</p>
                  </li>
                </ol>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={openWhatsApp}
                className="flex items-center justify-center gap-2 bg-[#9A9065] hover:bg-[#827753] text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow"
              >
                <MessageSquare className="w-5 h-5" />
                Contactar por WhatsApp
              </button>
              <Link
                href={`/cotizacion/${cotizacionId}`}
                className="flex items-center justify-center gap-2 bg-white border border-[#9A9065] text-[#9A9065] hover:bg-[#F0EBD8] font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow"
              >
                <FileText className="w-5 h-5" />
                Ver cotización completa
              </Link>
            </div>

            {/* Modal para WhatsApp */}
            {whatsappOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-in-up">
                  <h3 className="text-xl font-bold mb-4">Contactar por WhatsApp</h3>
                  <p className="mb-4">
                    No proporcionaste un número de teléfono. Puedes contactarnos directamente a nuestro WhatsApp:
                  </p>
                  <a
                    href="https://wa.me/56958665263?text=Hola,%20acabo%20de%20solicitar%20una%20cotización%20en%20Estudio%20Well.%20Me%20gustaría%20coordinar%20los%20siguientes%20pasos."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#9A9065] hover:bg-[#827753] text-white font-medium py-3 px-6 rounded-xl text-center mb-4"
                  >
                    Abrir WhatsApp
                  </a>
                  <button
                    onClick={() => setWhatsappOpen(false)}
                    className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-xl text-center"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pestaña de Detalles */}
        {activeTab === "detalles" && (
          <div className="animate-fade-in">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Detalles de la cotización</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-[#9A9065]" />
                    Especificaciones del proyecto
                  </h4>
                  <div className="space-y-4">
                    {formData && (
                      <>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-sm text-gray-500">Tipo de servicio</p>
                          <div className="flex items-center mt-1">
                            <div className="mr-2">
                              {getTipoServicioIcon(formData.tipo_servicio || "diseno_interiores")}
                            </div>
                            <p className="font-medium">
                              {formData.tipo_servicio === "diseno_interiores"
                                ? "Diseño de interiores"
                                : formData.tipo_servicio === "branding"
                                  ? "Branding"
                                  : "Diseño de interiores y Branding"}
                            </p>
                          </div>
                        </div>

                        {(formData.tipo_servicio === "diseno_interiores" || formData.tipo_servicio === "ambos") && (
                          <>
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-sm text-gray-500">Tipo de espacio</p>
                              <div className="flex items-center mt-1">
                                <span className="text-xl mr-2">{getTipoEspacioIcon(formData.tipo_espacio)}</span>
                                <p className="font-medium">{formatTipoEspacio(formData.tipo_espacio)}</p>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-sm text-gray-500">Dimensiones</p>
                              <div className="flex items-center mt-1">
                                <span className="text-xl mr-2">📏</span>
                                <p className="font-medium">{formData.metros_cuadrados} m²</p>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-sm text-gray-500">Estado actual</p>
                              <div className="flex items-center mt-1">
                                <span className="text-xl mr-2">{getEstadoIcon(formData.estado)}</span>
                                <p className="font-medium">{formatEstado(formData.estado)}</p>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-sm text-gray-500">Alcance del proyecto</p>
                              <div className="flex items-center mt-1">
                                <span className="text-xl mr-2">{getAlcanceIcon(formData.alcance)}</span>
                                <p className="font-medium">{formatAlcance(formData.alcance)}</p>
                              </div>
                            </div>
                          </>
                        )}

                        {(formData.tipo_servicio === "branding" || formData.tipo_servicio === "ambos") && (
                          <>
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-sm text-gray-500">Tipo de branding</p>
                              <div className="flex items-center mt-1">
                                <span className="text-xl mr-2">{getTipoBrandingIcon(formData.tipo_branding)}</span>
                                <p className="font-medium">{formatTipoBranding(formData.tipo_branding)}</p>
                              </div>
                            </div>

                            {formData.industria && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-sm text-gray-500">Industria</p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xl mr-2">🏭</span>
                                  <p className="font-medium">{formData.industria}</p>
                                </div>
                              </div>
                            )}

                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-sm text-gray-500">Características</p>
                              <div className="flex flex-col mt-1 space-y-2">
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">{formData.tiene_logo ? "✅" : "❌"}</span>
                                  <p className="font-medium">Ya tiene logo</p>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xl mr-2">{formData.tiene_materiales ? "✅" : "❌"}</span>
                                  <p className="font-medium">Tiene materiales de referencia</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-sm text-gray-500">Urgencia</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xl mr-2">{getUrgenciaIcon(formData.urgencia)}</span>
                            <p className="font-medium">{formData.urgencia}</p>
                          </div>
                        </div>

                        {formData.presupuesto && (
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-sm text-gray-500">Presupuesto aproximado</p>
                            <div className="flex items-center mt-1">
                              <span className="text-xl mr-2">💰</span>
                              <p className="font-medium">{formData.presupuesto}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-[#9A9065]" />
                    Datos de contacto
                  </h4>
                  <div className="space-y-4">
                    {formData && (
                      <>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-sm text-gray-500">Nombre</p>
                          <p className="font-medium">{formData.nombre}</p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{formData.email}</p>
                        </div>

                        {formData.telefono && (
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-sm text-gray-500">Teléfono</p>
                            <p className="font-medium">{formData.telefono}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <h4 className="font-medium text-gray-700 mt-6 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[#9A9065]" />
                    Detalles de la estimación
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-sm text-gray-500">Rango en UF</p>
                      <p className="font-medium">
                        UF {formatUF(ufMin)} - {formatUF(ufMax)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-sm text-gray-500">Rango en CLP</p>
                      <p className="font-medium">
                        {formatCLP(clpMin)} - {formatCLP(clpMax)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-sm text-gray-500">ID de cotización</p>
                      <p className="font-medium">{cotizacionId || "No disponible"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F0EBD8] rounded-xl p-5 border border-[#E8E6E1]">
              <h3 className="text-lg font-semibold mb-2 text-[#827753]">¿Qué incluye esta estimación?</h3>
              <p className="text-[#9A9065] mb-4">
                Esta estimación preliminar incluye los siguientes servicios según el tipo seleccionado:
              </p>

              {formData && (
                <>
                  {(formData.tipo_servicio === "diseno_interiores" || formData.tipo_servicio === "ambos") && (
                    <div className="mb-4">
                      <h4 className="font-medium text-[#827753] mb-2">Diseño de Interiores</h4>
                      {formData.alcance === "solo_diseño" ? (
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Levantamiento y mediciones del espacio</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Desarrollo de concepto y moodboard</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Planos técnicos y de distribución</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Selección de materiales y acabados</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Visualizaciones 3D del proyecto</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Documentación técnica para contratistas</span>
                          </li>
                        </ul>
                      ) : (
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Todo lo incluido en el servicio de diseño</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Gestión de contratistas y proveedores</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Supervisión de obra</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Coordinación de instalaciones</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Control de calidad durante la ejecución</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#9A9065] mr-2">✓</span>
                            <span>Entrega final del proyecto terminado</span>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}

                  {(formData.tipo_servicio === "branding" || formData.tipo_servicio === "ambos") && (
                    <div>
                      <h4 className="font-medium text-[#827753] mb-2">Branding</h4>
                      <ul className="space-y-2">
                        {formData.tipo_branding === "logo" ? (
                          <>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Investigación de mercado y competencia</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Desarrollo de concepto</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Diseño de logotipo (3 propuestas)</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Refinamiento y entrega de archivos finales</span>
                            </li>
                          </>
                        ) : formData.tipo_branding === "identidad_completa" ? (
                          <>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Todo lo incluido en el diseño de logo</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Paleta de colores y tipografía</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Diseño de papelería básica</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Elementos gráficos complementarios</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Manual de marca</span>
                            </li>
                          </>
                        ) : formData.tipo_branding === "rebranding" ? (
                          <>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Análisis de la marca actual</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Redefinición de identidad de marca</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Diseño de nueva identidad visual</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Estrategia de transición</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Manual de marca actualizado</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Servicios personalizados según necesidades</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-[#9A9065] mr-2">✓</span>
                              <span>Consultoría de marca</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}

              <p className="text-sm text-[#9A9065] mt-4">
                * Esta es una estimación preliminar. Los servicios específicos y costos finales se detallarán en la
                propuesta personalizada.
              </p>
            </div>
          </div>
        )}

        {/* Pestaña de Siguientes Pasos */}
        {activeTab === "pasos" && (
          <div className="animate-fade-in">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">¿Qué sigue ahora?</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#F0EBD8] rounded-full p-3 mr-4">
                    <Calendar className="w-6 h-6 text-[#9A9065]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Agendemos una reunión</h4>
                    <p className="text-gray-600">
                      Coordinaremos una reunión inicial para conocer más detalles sobre tu proyecto y expectativas.
                    </p>
                    <button
                      onClick={openWhatsApp}
                      className="mt-2 inline-flex items-center text-[#9A9065] hover:text-[#827753] font-medium"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contactar por WhatsApp
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#F0EBD8] rounded-full p-3 mr-4">
                    <FileText className="w-6 h-6 text-[#9A9065]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Propuesta detallada</h4>
                    <p className="text-gray-600">
                      Después de nuestra reunión, te enviaremos una propuesta detallada con alcance, cronograma y
                      presupuesto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#F0EBD8] rounded-full p-3 mr-4">
                    <Phone className="w-6 h-6 text-[#9A9065]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Contacto directo</h4>
                    <p className="text-gray-600">
                      Si prefieres hablar directamente con nosotros, puedes llamarnos o enviarnos un correo electrónico.
                    </p>
                    <div className="mt-2 space-y-1">
                      <a href="tel:+56958665263" className="block text-[#9A9065] hover:text-[#827753] font-medium">
                        +56 9 5866 5263
                      </a>
                      <a
                        href="mailto:estudiowell.info@gmail.com"
                        className="block text-[#9A9065] hover:text-[#827753] font-medium"
                      >
                        estudiowell.info@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#9A9065] rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-3">¿Por qué elegir Estudio Well?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="font-medium mb-2">Experiencia</h4>
                  <p className="text-sm text-[#F0EBD8]">
                    Diseñadores con experiencia internacional en diseño de interiores y branding.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="font-medium mb-2">Personalización</h4>
                  <p className="text-sm text-[#F0EBD8]">
                    Cada proyecto es único y adaptado a las necesidades específicas de tu negocio.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="font-medium mb-2">Resultados</h4>
                  <p className="text-sm text-[#F0EBD8]">
                    Espacios y marcas que no solo lucen bien, sino que también mejoran la experiencia y rentabilidad.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-xl transition-all duration-300"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

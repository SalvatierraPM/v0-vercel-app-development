"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import StepIndicator from "./StepIndicator"
import { calculateEstimate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { X, Upload, FileText, ImageIcon, File } from "lucide-react"

// Esquema de validación con Zod
const quoteFormSchema = z.object({
  tipo_servicio: z.enum(["diseno_interiores", "branding", "ambos"]),
  tipo_espacio: z.enum(["restaurante", "café", "showroom", "hotel", "otro"]).optional(),
  metros_cuadrados: z.number().min(1, "Ingresa un valor válido").max(10000, "Valor máximo excedido").optional(),
  estado: z.enum(["obra_gruesa", "remodelación", "deco"]).optional(),
  alcance: z.enum(["solo_diseño", "llave_en_mano"]).optional(),
  urgencia: z.enum(["<1 mes", "1-3 meses", ">3 meses"]),
  presupuesto: z.string().optional(),
  nombre: z.string().min(3, "Ingresa tu nombre completo"),
  email: z.string().email("Ingresa un email válido"),
  telefono: z.string().optional(),
  archivos: z.array(z.any()).optional(),
  // Campos específicos para branding
  tipo_branding: z.enum(["logo", "identidad_completa", "rebranding", "otro"]).optional(),
  industria: z.string().optional(),
  tiene_logo: z.boolean().optional(),
  tiene_materiales: z.boolean().optional(),
  descripcion_proyecto: z.string().optional(),
})

type QuoteFormValues = z.infer<typeof quoteFormSchema>

interface QuoteWizardProps {
  onComplete: (
    formData: QuoteFormValues,
    estimate: {
      ufMin: number
      ufMax: number
      clpMin: number
      clpMax: number
      formData: QuoteFormValues
    },
    cotizacionId: string,
  ) => void
}

// Función para obtener el tipo de archivo
const getFileType = (file: File): string => {
  const extension = file.name.split(".").pop()?.toLowerCase() || ""

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return "imagen"
  } else if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension)) {
    return "documento"
  } else if (["ai", "psd", "xd", "sketch", "fig"].includes(extension)) {
    return "diseno"
  } else if (["mp4", "mov", "avi", "webm"].includes(extension)) {
    return "video"
  }

  return "otro"
}

// Función para obtener el icono según el tipo de archivo
const getFileIcon = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || ""

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />
  } else if (["pdf"].includes(extension)) {
    return <FileText className="w-5 h-5 text-red-500" />
  } else if (["doc", "docx", "txt", "rtf"].includes(extension)) {
    return <FileText className="w-5 h-5 text-blue-500" />
  } else if (["ai", "psd", "xd", "sketch", "fig"].includes(extension)) {
    return <File className="w-5 h-5 text-purple-500" />
  } else if (["mp4", "mov", "avi", "webm"].includes(extension)) {
    return <File className="w-5 h-5 text-green-500" />
  }

  return <File className="w-5 h-5 text-gray-500" />
}

export default function QuoteWizard({ onComplete }: QuoteWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      tipo_servicio: "diseno_interiores",
      tipo_espacio: "restaurante",
      metros_cuadrados: 100,
      estado: "remodelación",
      alcance: "llave_en_mano",
      urgencia: "1-3 meses",
      presupuesto: "",
      nombre: "",
      email: "",
      telefono: "",
      archivos: [],
      tipo_branding: "identidad_completa",
      industria: "",
      tiene_logo: false,
      tiene_materiales: false,
      descripcion_proyecto: "",
    },
  })

  const watchedValues = watch()
  const tipoServicio = watch("tipo_servicio")

  const totalSteps = tipoServicio === "ambos" ? 5 : 4

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Último paso, enviar formulario
      handleFormSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      if (fileList.length > 10) {
        alert("Puedes subir un máximo de 10 archivos")
        return
      }

      const validFiles = fileList.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`El archivo ${file.name} excede el tamaño máximo de 10MB`)
          return false
        }
        return true
      })

      setSelectedFiles([...selectedFiles, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const uploadFiles = async (cotizacionId: string) => {
    const uploadPromises = selectedFiles.map(async (file) => {
      const fileExt = file.name.split(".").pop()
      const fileName = `${cotizacionId}/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage.from("cotizaciones").upload(fileName, file)

      if (error) {
        console.error("Error al subir archivo:", error)
        return null
      }

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("cotizaciones").getPublicUrl(fileName)

      return {
        url: publicUrl,
        nombre: file.name,
        cotizacion_id: cotizacionId,
        tipo: getFileType(file),
        tamano: file.size,
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)
    return uploadedFiles.filter(Boolean)
  }

  const handleFormSubmit = async () => {
    handleSubmit(async (data) => {
      setIsSubmitting(true)
      setDebugInfo("Iniciando proceso de envío...")
      try {
        // Calcular estimación
        const estimate = calculateEstimate(data)
        setDebugInfo("Estimación calculada correctamente")

        // Guardar cotización en Supabase
        setDebugInfo("Guardando cotización en Supabase...")
        const { data: cotizacion, error } = await supabase
          .from("cotizaciones")
          .insert({
            nombre: data.nombre,
            email: data.email,
            telefono: data.telefono || null,
            tipo_servicio: data.tipo_servicio,
            tipo_espacio: data.tipo_espacio || null,
            metros_cuadrados: data.metros_cuadrados || null,
            estado: data.estado || null,
            alcance: data.alcance || null,
            urgencia: data.urgencia,
            presupuesto: data.presupuesto || null,
            cotizacion_uf_min: estimate.ufMin,
            cotizacion_uf_max: estimate.ufMax,
            cotizacion_clp_min: estimate.clpMin,
            cotizacion_clp_max: estimate.clpMax,
          })
          .select()
          .single()

        if (error) {
          setDebugInfo(`Error al guardar cotización: ${error.message}`)
          throw error
        }

        setDebugInfo(`Cotización guardada con ID: ${cotizacion.id}`)

        // Subir archivos si hay
        if (selectedFiles.length > 0) {
          setDebugInfo("Subiendo archivos...")
          const uploadedFiles = await uploadFiles(cotizacion.id)

          // Guardar referencias a archivos en la base de datos
          if (uploadedFiles.length > 0) {
            setDebugInfo("Guardando referencias a archivos...")
            const { error: filesError } = await supabase.from("archivos_cotizacion").insert(uploadedFiles)

            if (filesError) {
              setDebugInfo(`Error al guardar archivos: ${filesError.message}`)
              console.error("Error al guardar archivos:", filesError)
            }
          }
        }

        // Enviar email de confirmación
        setDebugInfo("Enviando email de confirmación...")
        try {
          // Intentar con la nueva API primero
          const emailResponse = await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cotizacionId: cotizacion.id }),
          })

          const emailResult = await emailResponse.json()
          setDebugInfo(`Respuesta del servidor de email: ${JSON.stringify(emailResult)}`)

          if (!emailResult.success && emailResult.warning) {
            console.warn("Advertencia al enviar email:", emailResult.warning)

            // Si falla, intentar con la API de webhook como respaldo
            setDebugInfo("Intentando enviar email con método alternativo...")
            const backupResponse = await fetch("/api/send-confirmation", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: data.email,
                nombre: data.nombre,
                cotizacionId: cotizacion.id,
              }),
            })

            const backupResult = await backupResponse.json()
            setDebugInfo(`Respuesta del servidor de email (método alternativo): ${JSON.stringify(backupResult)}`)

            if (backupResult.success) {
              setDebugInfo("Email enviado correctamente con método alternativo")
            } else {
              setDebugInfo("No se pudo enviar el email con ningún método")
            }
          } else if (!emailResult.success && emailResult.error) {
            console.error("Error al enviar email:", emailResult.error)
            setDebugInfo(`Error al enviar email: ${emailResult.error}`)
          } else {
            setDebugInfo("Email enviado correctamente")
          }
        } catch (emailError) {
          setDebugInfo(
            `Error al enviar email: ${emailError instanceof Error ? emailError.message : String(emailError)}`,
          )
          console.error("Error al enviar email de confirmación:", emailError)
          // Continuamos con el flujo aunque falle el envío del email
        }

        // Enviar email de confirmación
        setDebugInfo("Proceso de cotización completado. El email se enviará desde el servidor.")
        console.log("Cotización guardada con éxito. ID:", cotizacion.id)

        // Llamar a la función de completado
        setDebugInfo("Proceso completado correctamente")
        onComplete(
          data,
          {
            ...estimate,
            formData: data,
          },
          cotizacion.id,
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        setDebugInfo(`Error general: ${errorMessage}`)
        console.error("Error al enviar formulario:", error)
        alert("Hubo un error al procesar tu cotización. Por favor intenta nuevamente.")
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  return (
    <div>
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {debugInfo && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Información de depuración:</h3>
          <pre className="text-xs text-yellow-700 whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      <form>
        {/* Paso 1: Tipo de servicio */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">¿Qué tipo de servicio necesitas?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "diseno_interiores", label: "Diseño de Interiores", icon: "🏠" },
                { value: "branding", label: "Branding", icon: "🎨" },
                { value: "ambos", label: "Ambos servicios", icon: "✨" },
              ].map((tipo) => (
                <div key={tipo.value} className="relative">
                  <input
                    type="radio"
                    id={`tipo_servicio_${tipo.value}`}
                    value={tipo.value}
                    className="peer sr-only"
                    {...register("tipo_servicio")}
                  />
                  <label
                    htmlFor={`tipo_servicio_${tipo.value}`}
                    className="flex flex-col items-center p-4 bg-white border rounded-lg cursor-pointer peer-checked:border-[#9A9065] peer-checked:bg-[#F0EBD8] hover:bg-gray-50"
                  >
                    <span className="text-2xl mb-2">{tipo.icon}</span>
                    <span className="text-lg">{tipo.label}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.tipo_servicio && <p className="text-red-500 text-sm">{errors.tipo_servicio.message}</p>}
          </div>
        )}

        {/* Paso 2: Detalles específicos según el tipo de servicio */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {tipoServicio === "diseno_interiores" || tipoServicio === "ambos" ? (
              <>
                <h2 className="text-xl font-semibold">Cuéntanos sobre el espacio</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="tipo_espacio" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de espacio
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {["restaurante", "café", "showroom", "hotel", "otro"].map((tipo) => (
                        <div key={tipo} className="relative">
                          <input
                            type="radio"
                            id={`tipo_${tipo}`}
                            value={tipo}
                            className="peer sr-only"
                            {...register("tipo_espacio")}
                          />
                          <label
                            htmlFor={`tipo_${tipo}`}
                            className="flex flex-col items-center p-4 bg-white border rounded-lg cursor-pointer peer-checked:border-[#9A9065] peer-checked:bg-[#F0EBD8] hover:bg-gray-50"
                          >
                            <span className="text-lg capitalize">{tipo}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.tipo_espacio && <p className="text-red-500 text-sm">{errors.tipo_espacio.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="metros_cuadrados" className="block text-sm font-medium text-gray-700 mb-1">
                      Metros cuadrados
                    </label>
                    <input
                      type="number"
                      id="metros_cuadrados"
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                      placeholder="Ej: 120"
                      {...register("metros_cuadrados", { valueAsNumber: true })}
                    />
                    {errors.metros_cuadrados && (
                      <p className="text-red-500 text-sm">{errors.metros_cuadrados.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado actual</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: "obra_gruesa", label: "Obra gruesa" },
                        { value: "remodelación", label: "Remodelación" },
                        { value: "deco", label: "Decoración" },
                      ].map((option) => (
                        <div key={option.value} className="relative">
                          <input
                            type="radio"
                            id={`estado_${option.value}`}
                            value={option.value}
                            className="peer sr-only"
                            {...register("estado")}
                          />
                          <label
                            htmlFor={`estado_${option.value}`}
                            className="flex items-center justify-center p-3 bg-white border rounded-lg cursor-pointer peer-checked:border-[#9A9065] peer-checked:bg-[#F0EBD8] hover:bg-gray-50"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.estado && <p className="text-red-500 text-sm">{errors.estado.message}</p>}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">Cuéntanos sobre tu proyecto de branding</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="tipo_branding" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de proyecto
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { value: "logo", label: "Solo logo" },
                        { value: "identidad_completa", label: "Identidad completa" },
                        { value: "rebranding", label: "Rebranding" },
                        { value: "otro", label: "Otro" },
                      ].map((tipo) => (
                        <div key={tipo.value} className="relative">
                          <input
                            type="radio"
                            id={`tipo_branding_${tipo.value}`}
                            value={tipo.value}
                            className="peer sr-only"
                            {...register("tipo_branding")}
                          />
                          <label
                            htmlFor={`tipo_branding_${tipo.value}`}
                            className="flex flex-col items-center p-4 bg-white border rounded-lg cursor-pointer peer-checked:border-[#9A9065] peer-checked:bg-[#F0EBD8] hover:bg-gray-50"
                          >
                            <span className="text-lg">{tipo.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.tipo_branding && <p className="text-red-500 text-sm">{errors.tipo_branding.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="industria" className="block text-sm font-medium text-gray-700 mb-1">
                      Industria o sector
                    </label>
                    <input
                      type="text"
                      id="industria"
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                      placeholder="Ej: Restaurante, Retail, Tecnología..."
                      {...register("industria")}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="tiene_logo"
                        className="h-4 w-4 text-[#9A9065] focus:ring-[#9A9065] border-gray-300 rounded"
                        {...register("tiene_logo")}
                      />
                      <label htmlFor="tiene_logo" className="ml-2 block text-sm text-gray-700">
                        Ya tengo un logo
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="tiene_materiales"
                        className="h-4 w-4 text-[#9A9065] focus:ring-[#9A9065] border-gray-300 rounded"
                        {...register("tiene_materiales")}
                      />
                      <label htmlFor="tiene_materiales" className="ml-2 block text-sm text-gray-700">
                        Tengo materiales de referencia
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="descripcion_proyecto" className="block text-sm font-medium text-gray-700 mb-1">
                      Describe brevemente tu proyecto
                    </label>
                    <textarea
                      id="descripcion_proyecto"
                      rows={4}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                      placeholder="Cuéntanos sobre tu marca, valores, público objetivo..."
                      {...register("descripcion_proyecto")}
                    ></textarea>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Paso 3: Detalles adicionales del proyecto */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {tipoServicio === "diseno_interiores" || tipoServicio === "ambos" ? (
              <>
                <h2 className="text-xl font-semibold">Detalles del proyecto</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alcance del proyecto</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { value: "solo_diseño", label: "Solo diseño" },
                        { value: "llave_en_mano", label: "Llave en mano (diseño + ejecución)" },
                      ].map((option) => (
                        <div key={option.value} className="relative">
                          <input
                            type="radio"
                            id={`alcance_${option.value}`}
                            value={option.value}
                            className="peer sr-only"
                            {...register("alcance")}
                          />
                          <label
                            htmlFor={`alcance_${option.value}`}
                            className="flex items-center justify-center p-3 bg-white border rounded-lg cursor-pointer peer-checked:border-[#9A9065] peer-checked:bg-[#F0EBD8] hover:bg-gray-50"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.alcance && <p className="text-red-500 text-sm">{errors.alcance.message}</p>}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">Detalles adicionales</h2>
                <p className="text-gray-600 mb-4">
                  Estos detalles nos ayudarán a entender mejor tu proyecto de branding y ofrecerte una cotización más
                  precisa.
                </p>
              </>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgencia</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: "<1 mes", label: "Menos de 1 mes" },
                    { value: "1-3 meses", label: "1-3 meses" },
                    { value: ">3 meses", label: "Más de 3 meses" },
                  ].map((option) => (
                    <div key={option.value} className="relative">
                      <input
                        type="radio"
                        id={`urgencia_${option.value}`}
                        value={option.value}
                        className="peer sr-only"
                        {...register("urgencia")}
                      />
                      <label
                        htmlFor={`urgencia_${option.value}`}
                        className="flex items-center justify-center p-3 bg-white border rounded-lg cursor-pointer peer-checked:border-[#9A9065] peer-checked:bg-[#F0EBD8] hover:bg-gray-50"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.urgencia && <p className="text-red-500 text-sm">{errors.urgencia.message}</p>}
              </div>

              <div>
                <label htmlFor="presupuesto" className="block text-sm font-medium text-gray-700 mb-1">
                  Presupuesto aproximado (opcional)
                </label>
                <input
                  type="text"
                  id="presupuesto"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                  placeholder="Ej: 5.000.000 CLP"
                  {...register("presupuesto")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso adicional para "ambos" servicios */}
        {tipoServicio === "ambos" && currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Detalles del proyecto de branding</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="tipo_branding" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de proyecto
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { value: "logo", label: "Solo logo" },
                    { value: "identidad_completa", label: "Identidad completa" },
                    { value: "rebranding", label: "Rebranding" },
                    { value: "otro", label: "Otro" },
                  ].map((tipo) => (
                    <div key={tipo.value} className="relative">
                      <input
                        type="radio"
                        id={`tipo_branding_${tipo.value}`}
                        value={tipo.value}
                        className="peer sr-only"
                        {...register("tipo_branding")}
                      />
                      <label
                        htmlFor={`tipo_branding_${tipo.value}`}
                        className="flex flex-col items-center p-4 bg-white border rounded-lg cursor-pointer peer-checked:border-[#9A9065] peer-checked:bg-[#F0EBD8] hover:bg-gray-50"
                      >
                        <span className="text-lg">{tipo.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.tipo_branding && <p className="text-red-500 text-sm">{errors.tipo_branding.message}</p>}
              </div>

              <div>
                <label htmlFor="industria" className="block text-sm font-medium text-gray-700 mb-1">
                  Industria o sector
                </label>
                <input
                  type="text"
                  id="industria"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                  placeholder="Ej: Restaurante, Retail, Tecnología..."
                  {...register("industria")}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tiene_logo"
                    className="h-4 w-4 text-[#9A9065] focus:ring-[#9A9065] border-gray-300 rounded"
                    {...register("tiene_logo")}
                  />
                  <label htmlFor="tiene_logo" className="ml-2 block text-sm text-gray-700">
                    Ya tengo un logo
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tiene_materiales"
                    className="h-4 w-4 text-[#9A9065] focus:ring-[#9A9065] border-gray-300 rounded"
                    {...register("tiene_materiales")}
                  />
                  <label htmlFor="tiene_materiales" className="ml-2 block text-sm text-gray-700">
                    Tengo materiales de referencia
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="descripcion_proyecto" className="block text-sm font-medium text-gray-700 mb-1">
                  Describe brevemente tu proyecto
                </label>
                <textarea
                  id="descripcion_proyecto"
                  rows={4}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                  placeholder="Cuéntanos sobre tu marca, valores, público objetivo..."
                  {...register("descripcion_proyecto")}
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Paso 4 (o 5 si es ambos): Datos de contacto y archivos */}
        {((tipoServicio !== "ambos" && currentStep === 4) || (tipoServicio === "ambos" && currentStep === 5)) && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Datos de contacto</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                  placeholder="Tu nombre"
                  {...register("nombre")}
                />
                {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                  placeholder="tu@email.com"
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (opcional, para WhatsApp)
                </label>
                <input
                  type="tel"
                  id="telefono"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9A9065]"
                  placeholder="+56 9 1234 5678"
                  {...register("telefono")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Archivos de referencia (opcional)
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (e.dataTransfer.files) {
                      const fileList = Array.from(e.dataTransfer.files)
                      if (fileList.length + selectedFiles.length > 10) {
                        alert("Puedes subir un máximo de 10 archivos en total")
                        return
                      }
                      setSelectedFiles([...selectedFiles, ...fileList.slice(0, 10 - selectedFiles.length)])
                    }
                  }}
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <input
                      type="file"
                      id="archivos"
                      className="hidden"
                      multiple
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.adobe.illustrator,application/postscript,application/x-photoshop,application/octet-stream,video/*"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="archivos" className="cursor-pointer text-[#9A9065] hover:text-[#827753]">
                      Seleccionar archivos
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Arrastra y suelta archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes subir imágenes, documentos, archivos de diseño y videos (máx. 10MB cada uno)
                    </p>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Archivos seleccionados ({selectedFiles.length}/10):
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center">
                            {getFileIcon(file)}
                            <span className="ml-2 text-sm truncate max-w-xs">{file.name}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Eliminar archivo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-2">Puedes subir hasta 10 archivos (máx. 10MB cada uno)</p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
              disabled={isSubmitting}
            >
              Anterior
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            onClick={nextStep}
            className="bg-[#9A9065] hover:bg-[#827753] text-white font-bold py-2 px-4 rounded transition-colors"
            disabled={isSubmitting}
          >
            {currentStep < totalSteps ? "Siguiente" : isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  )
}

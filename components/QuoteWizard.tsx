"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import StepIndicator from "./StepIndicator"
import { calculateEstimate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// Esquema de validación con Zod
const quoteFormSchema = z.object({
  tipo_espacio: z.enum(["restaurante", "café", "showroom", "hotel", "otro"]),
  metros_cuadrados: z.number().min(1, "Ingresa un valor válido").max(10000, "Valor máximo excedido"),
  estado: z.enum(["obra_gruesa", "remodelación", "deco"]),
  alcance: z.enum(["solo_diseño", "llave_en_mano"]),
  urgencia: z.enum(["<1 mes", "1-3 meses", ">3 meses"]),
  presupuesto: z.string().optional(),
  nombre: z.string().min(3, "Ingresa tu nombre completo"),
  email: z.string().email("Ingresa un email válido"),
  telefono: z.string().optional(),
  archivos: z.array(z.any()).optional(),
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
    },
  })

  const watchedValues = watch()

  const nextStep = () => {
    if (currentStep < 4) {
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
      if (fileList.length > 5) {
        alert("Puedes subir un máximo de 5 archivos")
        return
      }

      const validFiles = fileList.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`El archivo ${file.name} excede el tamaño máximo de 5MB`)
          return false
        }
        return true
      })

      setSelectedFiles(validFiles)
    }
  }

  const uploadFiles = async (cotizacionId: string) => {
    const uploadPromises = selectedFiles.map(async (file) => {
      const fileExt = file.name.split(".").pop()
      const fileName = `${cotizacionId}/${Date.now()}.${fileExt}`
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
            tipo_espacio: data.tipo_espacio,
            metros_cuadrados: data.metros_cuadrados,
            estado: data.estado,
            alcance: data.alcance,
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
          const emailResponse = await fetch("/api/webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: cotizacion.id }),
          })

          const emailResult = await emailResponse.json()
          setDebugInfo(`Respuesta del servidor de email: ${JSON.stringify(emailResult)}`)

          if (!emailResult.success && emailResult.warning) {
            console.warn("Advertencia al enviar email:", emailResult.warning)
          } else if (!emailResult.success && emailResult.error) {
            console.error("Error al enviar email:", emailResult.error)
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
        <StepIndicator currentStep={currentStep} totalSteps={4} />
      </div>

      {debugInfo && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Información de depuración:</h3>
          <pre className="text-xs text-yellow-700 whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      <form>
        {/* Paso 1: Tipo de espacio */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">¿Qué tipo de espacio quieres diseñar?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="flex flex-col items-center p-4 bg-white border rounded-lg cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 hover:bg-gray-50"
                  >
                    <span className="text-lg capitalize">{tipo}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.tipo_espacio && <p className="text-red-500 text-sm">{errors.tipo_espacio.message}</p>}
          </div>
        )}

        {/* Paso 2: Metros cuadrados y estado */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Cuéntanos sobre el espacio</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="metros_cuadrados" className="block text-sm font-medium text-gray-700 mb-1">
                  Metros cuadrados
                </label>
                <input
                  type="number"
                  id="metros_cuadrados"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ej: 120"
                  {...register("metros_cuadrados", { valueAsNumber: true })}
                />
                {errors.metros_cuadrados && <p className="text-red-500 text-sm">{errors.metros_cuadrados.message}</p>}
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
                        className="flex items-center justify-center p-3 bg-white border rounded-lg cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 hover:bg-gray-50"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.estado && <p className="text-red-500 text-sm">{errors.estado.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Alcance, urgencia y presupuesto */}
        {currentStep === 3 && (
          <div className="space-y-6">
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
                        className="flex items-center justify-center p-3 bg-white border rounded-lg cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 hover:bg-gray-50"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.alcance && <p className="text-red-500 text-sm">{errors.alcance.message}</p>}
              </div>

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
                        className="flex items-center justify-center p-3 bg-white border rounded-lg cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 hover:bg-gray-50"
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
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ej: 5.000.000 CLP"
                  {...register("presupuesto")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Datos de contacto y archivos */}
        {currentStep === 4 && (
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
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+56 9 1234 5678"
                  {...register("telefono")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imágenes de referencia (opcional)
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (e.dataTransfer.files) {
                      const fileList = Array.from(e.dataTransfer.files)
                      setSelectedFiles(fileList.slice(0, 5))
                    }
                  }}
                >
                  <input
                    type="file"
                    id="archivos"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="archivos" className="cursor-pointer text-emerald-600 hover:text-emerald-800">
                    Seleccionar archivos
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Arrastra y suelta archivos aquí o haz clic para seleccionar
                  </p>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Archivos seleccionados:</p>
                    <ul className="text-sm text-gray-500">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">Puedes subir hasta 5 imágenes (máx. 5MB cada una)</p>
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
            disabled={isSubmitting}
          >
            {currentStep < 4 ? "Siguiente" : isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  )
}

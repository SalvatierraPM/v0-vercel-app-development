"use client"

import { useState } from "react"
import StepIndicator from "./StepIndicator"

export default function QuoteWizardPreview() {
  const [currentStep, setCurrentStep] = useState(1)

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Mostrar resultados
      setShowResults(true)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const [showResults, setShowResults] = useState(false)

  if (showResults) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-emerald-600 text-white p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Tu cotización está lista</h2>
          <p className="text-emerald-100">Basado en tus requerimientos, hemos preparado la siguiente estimación</p>
        </div>

        <div className="p-6">
          <div className="mb-8 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Rango de inversión estimado</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-emerald-700 mb-1">UF</p>
                <p className="text-3xl font-bold text-emerald-800">126.00 - 154.00</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">CLP (aproximado)</p>
                <p className="text-2xl font-bold text-gray-800">$4.410.000 - $5.390.000</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Detalles del proyecto</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex justify-between">
                  <span>Tipo de espacio:</span>
                  <span className="font-medium capitalize">restaurante</span>
                </li>
                <li className="flex justify-between">
                  <span>Metros cuadrados:</span>
                  <span className="font-medium">100 m²</span>
                </li>
                <li className="flex justify-between">
                  <span>Estado actual:</span>
                  <span className="font-medium capitalize">remodelación</span>
                </li>
                <li className="flex justify-between">
                  <span>Alcance:</span>
                  <span className="font-medium capitalize">llave en mano</span>
                </li>
                <li className="flex justify-between">
                  <span>Urgencia:</span>
                  <span className="font-medium">1-3 meses</span>
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
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Agenda una reunión
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors">
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} totalSteps={4} />
      </div>

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
                  name="tipo_espacio"
                  defaultChecked={tipo === "restaurante"}
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
                defaultValue={100}
              />
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
                      name="estado"
                      className="peer sr-only"
                      defaultChecked={option.value === "remodelación"}
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
                      name="alcance"
                      className="peer sr-only"
                      defaultChecked={option.value === "llave_en_mano"}
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
                      name="urgencia"
                      className="peer sr-only"
                      defaultChecked={option.value === "1-3 meses"}
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
                defaultValue="Juan Pérez"
              />
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
                defaultValue="juan@ejemplo.com"
              />
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
                defaultValue="+56912345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes de referencia (opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="cursor-pointer text-emerald-600 hover:text-emerald-800">Seleccionar archivos</p>
                <p className="text-sm text-gray-500 mt-1">
                  Arrastra y suelta archivos aquí o haz clic para seleccionar
                </p>
              </div>
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
        >
          {currentStep < 4 ? "Siguiente" : "Enviar"}
        </button>
      </div>
    </div>
  )
}

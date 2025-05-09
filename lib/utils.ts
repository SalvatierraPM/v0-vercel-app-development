import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Función para combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para calcular la cotización
export function calculateEstimate(formData: {
  metros_cuadrados: number
  alcance: string
  urgencia: string
}) {
  // Cálculo base según los parámetros
  let base = formData.metros_cuadrados * (formData.alcance === "llave_en_mano" ? 1.4 : 0.9)

  // Ajuste por urgencia
  if (formData.urgencia === "<1 mes") {
    base *= 1.1
  }

  // Calcular rango
  const ufMin = Number.parseFloat((base * 0.9).toFixed(2))
  const ufMax = Number.parseFloat((base * 1.1).toFixed(2))

  // Valor de UF aproximado (en una implementación real, se obtendría de la API)
  const ufValue = 35000

  // Convertir a CLP
  const clpMin = Math.round(ufMin * ufValue)
  const clpMax = Math.round(ufMax * ufValue)

  return {
    ufMin,
    ufMax,
    clpMin,
    clpMax,
  }
}

// Función para formatear valores en CLP
export function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Función para formatear valores en UF
export function formatUF(amount: number) {
  return amount.toFixed(2)
}

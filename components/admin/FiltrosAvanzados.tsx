"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, FilterIcon, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface FiltrosAvanzadosProps {
  onFilterChange: (filters: FilterOptions) => void
  onReset: () => void
}

export interface FilterOptions {
  fechaInicio?: Date
  fechaFin?: Date
  tipoEspacio?: string
  rangoUFMin?: number
  rangoUFMax?: number
  metrosMin?: number
  metrosMax?: number
}

export default function FiltrosAvanzados({ onFilterChange, onReset }: FiltrosAvanzadosProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined)
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined)
  const [filtersApplied, setFiltersApplied] = useState(false)

  const tiposEspacio = [
    { value: "", label: "Todos los tipos" },
    { value: "restaurante", label: "Restaurante" },
    { value: "café", label: "Café" },
    { value: "bar", label: "Bar" },
    { value: "tienda", label: "Tienda" },
    { value: "oficina", label: "Oficina" },
    { value: "hotel", label: "Hotel" },
    { value: "showroom", label: "Showroom" },
    { value: "otro", label: "Otro" },
  ]

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    const updatedFilters = {
      ...filters,
      fechaInicio,
      fechaFin,
    }
    onFilterChange(updatedFilters)
    setIsOpen(false)
    setFiltersApplied(true)
  }

  const handleResetFilters = () => {
    setFilters({})
    setFechaInicio(undefined)
    setFechaFin(undefined)
    setFiltersApplied(false)
    onReset()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={filtersApplied ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-2 ${filtersApplied ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
            >
              <FilterIcon size={16} />
              <span>Filtros avanzados</span>
              {filtersApplied && (
                <span className="bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4" align="start">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Filtros avanzados</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de espacio</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.tipoEspacio || ""}
                  onChange={(e) => handleFilterChange("tipoEspacio", e.target.value)}
                >
                  {tiposEspacio.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metros² mínimos</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Min"
                    value={filters.metrosMin || ""}
                    onChange={(e) =>
                      handleFilterChange("metrosMin", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metros² máximos</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Max"
                    value={filters.metrosMax || ""}
                    onChange={(e) =>
                      handleFilterChange("metrosMax", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">UF mínimo</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Min"
                    value={filters.rangoUFMin || ""}
                    onChange={(e) =>
                      handleFilterChange("rangoUFMin", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">UF máximo</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Max"
                    value={filters.rangoUFMax || ""}
                    onChange={(e) =>
                      handleFilterChange("rangoUFMax", e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rango de fechas</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fechaInicio ? format(fechaInicio, "dd/MM/yyyy", { locale: es }) : <span>Fecha inicio</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={fechaInicio} onSelect={setFechaInicio} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fechaFin ? format(fechaFin, "dd/MM/yyyy", { locale: es }) : <span>Fecha fin</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={fechaFin} onSelect={setFechaFin} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Limpiar filtros
                </Button>
                <Button onClick={handleApplyFilters} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {filtersApplied && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X size={16} className="mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}

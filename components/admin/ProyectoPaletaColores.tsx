"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Palette, Save, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ProyectoPaletaColoresProps {
  proyectoId: string
  readOnly?: boolean
}

interface PaletaColores {
  id?: string
  proyecto_id: string
  color_primario: string
  color_secundario: string
  color_acento: string
  color_texto: string
  color_fondo: string
}

const paletasPredefinidasEstudioWell = [
  {
    nombre: "Esmeralda",
    color_primario: "#10b981",
    color_secundario: "#0ea5e9",
    color_acento: "#f59e0b",
    color_texto: "#1f2937",
    color_fondo: "#f9fafb",
  },
  {
    nombre: "Terracota",
    color_primario: "#e11d48",
    color_secundario: "#fb7185",
    color_acento: "#fbbf24",
    color_texto: "#1f2937",
    color_fondo: "#fef2f2",
  },
  {
    nombre: "Azul Marino",
    color_primario: "#1e40af",
    color_secundario: "#3b82f6",
    color_acento: "#a855f7",
    color_texto: "#1f2937",
    color_fondo: "#f0f9ff",
  },
  {
    nombre: "Oliva",
    color_primario: "#65a30d",
    color_secundario: "#84cc16",
    color_acento: "#facc15",
    color_texto: "#1f2937",
    color_fondo: "#f7fee7",
  },
  {
    nombre: "Morado",
    color_primario: "#7e22ce",
    color_secundario: "#a855f7",
    color_acento: "#ec4899",
    color_texto: "#1f2937",
    color_fondo: "#faf5ff",
  },
]

export default function ProyectoPaletaColores({ proyectoId, readOnly = false }: ProyectoPaletaColoresProps) {
  const [paleta, setPaleta] = useState<PaletaColores>({
    proyecto_id: proyectoId,
    color_primario: "#10b981",
    color_secundario: "#0ea5e9",
    color_acento: "#f59e0b",
    color_texto: "#1f2937",
    color_fondo: "#f9fafb",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchPaleta = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("proyecto_paletas")
          .select("*")
          .eq("proyecto_id", proyectoId)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 es el código para "no se encontraron resultados"
          throw error
        }

        if (data) {
          setPaleta(data)
        }
      } catch (err) {
        console.error("Error al cargar paleta de colores:", err)
        setError("No se pudo cargar la paleta de colores")
      } finally {
        setLoading(false)
      }
    }

    if (proyectoId) {
      fetchPaleta()
    }
  }, [proyectoId, supabase])

  const handleColorChange = (campo: keyof PaletaColores, valor: string) => {
    setPaleta((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const handleSavePaleta = async () => {
    try {
      setSaving(true)
      setError(null)

      const { data, error } = await supabase
        .from("proyecto_paletas")
        .upsert(
          {
            proyecto_id: proyectoId,
            color_primario: paleta.color_primario,
            color_secundario: paleta.color_secundario,
            color_acento: paleta.color_acento,
            color_texto: paleta.color_texto,
            color_fondo: paleta.color_fondo,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "proyecto_id" },
        )
        .select()

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        setPaleta(data[0])
        toast({
          title: "Paleta guardada",
          description: "La paleta de colores se ha guardado correctamente",
          variant: "default",
        })
      }
    } catch (err) {
      console.error("Error al guardar paleta:", err)
      setError("No se pudo guardar la paleta de colores")
      toast({
        title: "Error",
        description: "No se pudo guardar la paleta de colores",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const aplicarPaletaPredefinida = (paletaPredefinida: (typeof paletasPredefinidasEstudioWell)[0]) => {
    setPaleta((prev) => ({
      ...prev,
      color_primario: paletaPredefinida.color_primario,
      color_secundario: paletaPredefinida.color_secundario,
      color_acento: paletaPredefinida.color_acento,
      color_texto: paletaPredefinida.color_texto,
      color_fondo: paletaPredefinida.color_fondo,
    }))
  }

  if (loading) {
    return <div className="text-center py-4">Cargando paleta de colores...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Palette className="h-5 w-5 mr-2 text-emerald-600" />
          Paleta de colores del proyecto
        </h3>
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSavePaleta}
            disabled={saving}
            className="flex items-center"
          >
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar paleta
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        {/* Vista previa de la paleta */}
        <div
          className="mb-6 p-4 rounded-lg border"
          style={{ backgroundColor: paleta.color_fondo, color: paleta.color_texto }}
        >
          <h4 className="text-lg font-semibold mb-2" style={{ color: paleta.color_primario }}>
            Vista previa de la paleta
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            <div
              className="px-3 py-1 rounded-full text-white text-sm"
              style={{ backgroundColor: paleta.color_primario }}
            >
              Color primario
            </div>
            <div
              className="px-3 py-1 rounded-full text-white text-sm"
              style={{ backgroundColor: paleta.color_secundario }}
            >
              Color secundario
            </div>
            <div className="px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: paleta.color_acento }}>
              Color acento
            </div>
          </div>
          <p className="mb-2">Este es un ejemplo de texto con el color de texto seleccionado.</p>
          <button
            className="px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: paleta.color_primario }}
            disabled
          >
            Botón primario
          </button>
        </div>

        {!readOnly && (
          <>
            {/* Paletas predefinidas */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Paletas predefinidas</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {paletasPredefinidasEstudioWell.map((paletaPredefinida, index) => (
                  <button
                    key={index}
                    onClick={() => aplicarPaletaPredefinida(paletaPredefinida)}
                    className="p-2 rounded-md border hover:border-emerald-500 transition-colors relative"
                  >
                    <div className="flex flex-col space-y-1">
                      <div
                        className="h-4 rounded-sm"
                        style={{ backgroundColor: paletaPredefinida.color_primario }}
                      ></div>
                      <div
                        className="h-4 rounded-sm"
                        style={{ backgroundColor: paletaPredefinida.color_secundario }}
                      ></div>
                      <div className="h-4 rounded-sm" style={{ backgroundColor: paletaPredefinida.color_acento }}></div>
                    </div>
                    <span className="text-xs mt-1 block text-center">{paletaPredefinida.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de colores personalizado */}
            <div>
              <h4 className="text-sm font-medium mb-3">Personalizar colores</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Color primario</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={paleta.color_primario}
                      onChange={(e) => handleColorChange("color_primario", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={paleta.color_primario}
                      onChange={(e) => handleColorChange("color_primario", e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color secundario</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={paleta.color_secundario}
                      onChange={(e) => handleColorChange("color_secundario", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={paleta.color_secundario}
                      onChange={(e) => handleColorChange("color_secundario", e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color acento</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={paleta.color_acento}
                      onChange={(e) => handleColorChange("color_acento", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={paleta.color_acento}
                      onChange={(e) => handleColorChange("color_acento", e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color de texto</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={paleta.color_texto}
                      onChange={(e) => handleColorChange("color_texto", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={paleta.color_texto}
                      onChange={(e) => handleColorChange("color_texto", e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color de fondo</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={paleta.color_fondo}
                      onChange={(e) => handleColorChange("color_fondo", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={paleta.color_fondo}
                      onChange={(e) => handleColorChange("color_fondo", e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

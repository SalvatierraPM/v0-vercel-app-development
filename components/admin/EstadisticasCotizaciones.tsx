"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatUF } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface EstadisticasCotizacionesProps {
  cotizaciones: any[]
}

export default function EstadisticasCotizaciones({ cotizaciones }: EstadisticasCotizacionesProps) {
  const [activeTab, setActiveTab] = useState("resumen")

  // Calcular estadísticas generales
  const totalCotizaciones = cotizaciones.length
  const cotizacionesAprobadas = cotizaciones.filter((c) => c.estado === "aprobada").length
  const cotizacionesPendientes = cotizaciones.filter((c) => !c.estado || c.estado === "pendiente").length
  const cotizacionesRechazadas = cotizaciones.filter((c) => c.estado === "rechazada").length

  const promedioUFMin =
    cotizaciones.length > 0
      ? cotizaciones.reduce((sum, c) => sum + (c.cotizacion_uf_min || 0), 0) / cotizaciones.length
      : 0

  const promedioUFMax =
    cotizaciones.length > 0
      ? cotizaciones.reduce((sum, c) => sum + (c.cotizacion_uf_max || 0), 0) / cotizaciones.length
      : 0

  // Datos para gráfico de tipos de espacio
  const tiposEspacioCount = cotizaciones.reduce((acc: Record<string, number>, c) => {
    const tipo = c.tipo_espacio || "No especificado"
    acc[tipo] = (acc[tipo] || 0) + 1
    return acc
  }, {})

  const tiposEspacioData = Object.entries(tiposEspacioCount).map(([name, value]) => ({
    name,
    value,
  }))

  // Datos para gráfico de estados
  const estadosData = [
    { name: "Pendientes", value: cotizacionesPendientes },
    { name: "Aprobadas", value: cotizacionesAprobadas },
    { name: "Rechazadas", value: cotizacionesRechazadas },
  ]

  // Datos para gráfico de metros cuadrados
  const metrosCuadradosRanges = [
    { range: "0-50", min: 0, max: 50 },
    { range: "51-100", min: 51, max: 100 },
    { range: "101-200", min: 101, max: 200 },
    { range: "201-300", min: 201, max: 300 },
    { range: ">300", min: 301, max: Number.POSITIVE_INFINITY },
  ]

  const metrosCuadradosData = metrosCuadradosRanges.map((range) => ({
    name: range.range,
    value: cotizaciones.filter((c) => c.metros_cuadrados >= range.min && c.metros_cuadrados <= range.max).length,
  }))

  // Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas de Cotizaciones</CardTitle>
        <CardDescription>Análisis de cotizaciones y tendencias</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resumen" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="tipos">Tipos de Espacio</TabsTrigger>
            <TabsTrigger value="metros">Metros Cuadrados</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Total Cotizaciones</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold">{totalCotizaciones}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Promedio UF</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold">
                    {formatUF(promedioUFMin)} - {formatUF(promedioUFMax)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Tasa de Aprobación</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold">
                    {totalCotizaciones > 0 ? Math.round((cotizacionesAprobadas / totalCotizaciones) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estadosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cotizaciones`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="tipos" className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tiposEspacioData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} cotizaciones`, "Cantidad"]} />
                <Bar dataKey="value" fill="#10B981" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="metros" className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrosCuadradosData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} cotizaciones`, "Cantidad"]} />
                <Bar dataKey="value" fill="#3B82F6" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

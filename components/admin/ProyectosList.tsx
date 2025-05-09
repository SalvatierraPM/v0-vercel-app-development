"use client"

import { useState } from "react"
import Link from "next/link"
import { formatCLP } from "@/lib/utils"

interface ProyectosListProps {
  proyectos: any[]
}

export default function ProyectosList({ proyectos: initialProyectos }: ProyectosListProps) {
  const [proyectos] = useState(initialProyectos)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Proyectos</h1>
        <div className="flex space-x-2">
          <Link
            href="/admin/proyectos/tablero"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Ver Tablero
          </Link>
          <Link
            href="/admin/proyectos/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Nuevo Proyecto
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar proyecto..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proyectos.length > 0 ? (
                proyectos.map((proyecto) => (
                  <tr key={proyecto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/proyectos/${proyecto.id}`} className="block">
                        <div className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors">
                          {proyecto.nombre}
                        </div>
                        <div className="text-sm text-gray-500">{proyecto.descripcion?.substring(0, 30) || "-"}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proyecto.cliente_nombre || "Cliente"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        Inicio:{" "}
                        {proyecto.fecha_inicio ? new Date(proyecto.fecha_inicio).toLocaleDateString("es-ES") : "-"}
                      </div>
                      <div>
                        Fin est.:{" "}
                        {proyecto.fecha_fin_estimada
                          ? new Date(proyecto.fecha_fin_estimada).toLocaleDateString("es-ES")
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatCLP(proyecto.presupuesto_total || 0)}</div>
                      <div className="text-xs text-gray-400">Pagado: {formatCLP(proyecto.monto_pagado || 0)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          proyecto.estado === "planificacion"
                            ? "bg-blue-100 text-blue-800"
                            : proyecto.estado === "ejecucion"
                              ? "bg-yellow-100 text-yellow-800"
                              : proyecto.estado === "finalizado"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {proyecto.estado || "planificacion"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: `${proyecto.porcentaje_completado || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {proyecto.porcentaje_completado || 0}% completado
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay proyectos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

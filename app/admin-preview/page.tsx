export default function AdminPreviewPage() {
  // Datos de ejemplo
  const leads = [
    {
      id: "1",
      created_at: "2023-05-15T10:30:00Z",
      nombre: "Juan Pérez",
      email: "juan@ejemplo.com",
      telefono: "+56912345678",
      tipo_espacio: "restaurante",
      metros_cuadrados: 150,
      estado: "obra_gruesa",
      alcance: "llave_en_mano",
      urgencia: "1-3 meses",
      cotizacion_uf_min: 189,
      cotizacion_uf_max: 231,
      archivos: ["https://example.com/file1.jpg", "https://example.com/file2.jpg"],
    },
    {
      id: "2",
      created_at: "2023-05-14T15:45:00Z",
      nombre: "María González",
      email: "maria@ejemplo.com",
      telefono: "+56987654321",
      tipo_espacio: "café",
      metros_cuadrados: 80,
      estado: "remodelación",
      alcance: "solo_diseño",
      urgencia: ">3 meses",
      cotizacion_uf_min: 64.8,
      cotizacion_uf_max: 79.2,
      archivos: [],
    },
    {
      id: "3",
      created_at: "2023-05-13T09:15:00Z",
      nombre: "Carlos Rodríguez",
      email: "carlos@ejemplo.com",
      telefono: "",
      tipo_espacio: "hotel",
      metros_cuadrados: 300,
      estado: "deco",
      alcance: "llave_en_mano",
      urgencia: "<1 mes",
      cotizacion_uf_min: 378,
      cotizacion_uf_max: 462,
      archivos: ["https://example.com/file3.jpg"],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración - Cotizaciones</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M²</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cotización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archivos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.telefono || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.tipo_espacio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.metros_cuadrados}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.cotizacion_uf_min} - {lead.cotizacion_uf_max} UF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.archivos && lead.archivos.length > 0 ? (
                      <div className="flex space-x-2">
                        {lead.archivos.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Archivo {index + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      "Sin archivos"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

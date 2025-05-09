import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              EW
            </div>
            <span className="ml-2 text-xl font-semibold">Estudio Well</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/quote"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Cotiza tu proyecto
            </Link>
            <Link href="/admin/login" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
              Acceso Admin
            </Link>
          </nav>
        </div>
      </header>

      <section className="py-20 bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Diseño de interiores que transforma espacios</h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Creamos espacios funcionales y estéticos que reflejan tu personalidad y necesidades. Desde restaurantes
            hasta hoteles, transformamos tu visión en realidad.
          </p>
          <Link
            href="/quote"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded text-lg transition-colors"
          >
            Cotiza tu proyecto
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Diseño de Restaurantes",
                description:
                  "Creamos ambientes que complementan tu propuesta gastronómica y atraen a tus clientes ideales.",
              },
              {
                title: "Espacios Comerciales",
                description: "Diseñamos showrooms y tiendas que destacan tu marca y mejoran la experiencia de compra.",
              },
              {
                title: "Hoteles y Hospedaje",
                description:
                  "Desarrollamos espacios acogedores y funcionales que harán que tus huéspedes quieran volver.",
              },
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 font-bold">
                EW
              </div>
              <p className="mt-2">© {new Date().getFullYear()} Estudio Well. Todos los derechos reservados.</p>
            </div>
            <div>
              <Link
                href="/quote"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Cotiza tu proyecto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

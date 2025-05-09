"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ArrowRight, ChevronRight, MapPin, Mail, Phone, X, Loader2, User } from "lucide-react"

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  })
  const [formStatus, setFormStatus] = useState<{
    status: "idle" | "loading" | "success" | "error"
    message: string
  }>({
    status: "idle",
    message: "",
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!contactForm.nombre || !contactForm.email || !contactForm.mensaje) {
      setFormStatus({
        status: "error",
        message: "Por favor completa todos los campos obligatorios.",
      })
      return
    }

    setFormStatus({
      status: "loading",
      message: "Enviando mensaje...",
    })

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      })

      const data = await response.json()

      if (data.success) {
        setFormStatus({
          status: "success",
          message: "¡Mensaje enviado con éxito! Te contactaremos pronto.",
        })
        // Limpiar formulario
        setContactForm({
          nombre: "",
          email: "",
          telefono: "",
          asunto: "",
          mensaje: "",
        })
      } else {
        setFormStatus({
          status: "error",
          message: data.error || "Hubo un error al enviar el mensaje. Por favor intenta nuevamente.",
        })
      }
    } catch (error) {
      setFormStatus({
        status: "error",
        message: "Hubo un error al enviar el mensaje. Por favor intenta nuevamente.",
      })
    }
  }

  const projects = [
    {
      image: "/aima-patagonia.jpg",
      title: "Aima – Fuegos de la Patagonia",
      location: "Punta Arenas",
      year: "2024-2025",
      description:
        "Proyecto de diseño interior para restaurante especializado en cocina patagónica, donde se destacan materiales nobles y una paleta de colores inspirada en los paisajes del sur de Chile.",
    },
    {
      image: "/lappart-canallas.png",
      title: "L'Appart | Los Canallas",
      location: "Providencia",
      year: "2023",
      description:
        "Rediseño de espacio gastronómico que combina la esencia francesa con toques latinoamericanos. El proyecto incluye zonificación, iluminación estratégica y selección de mobiliario.",
    },
    {
      image: "/verde-sazon.png",
      title: "Verde Sazón",
      location: "Providencia",
      year: "2023",
      description:
        "Diseño integral para restaurante de cocina vegetariana, donde se priorizaron materiales naturales, iluminación cálida y una paleta de colores que evoca frescura y naturalidad.",
    },
    {
      image: "/casa-quilla.png",
      title: "Casa Quilla",
      location: "Curanipe",
      year: "2023",
      description:
        "Proyecto residencial en la costa que busca integrarse con el entorno natural. Se utilizaron materiales locales y técnicas tradicionales reinterpretadas con un lenguaje contemporáneo.",
    },
    {
      image: "/dipsys-backyard.png",
      title: "Dipsy's Backyard",
      location: "Vitacura",
      year: "En construcción, 2025",
      description:
        "Proyecto en desarrollo para espacio de entretenimiento al aire libre, con énfasis en la sostenibilidad y la creación de ambientes versátiles para diferentes tipos de eventos.",
    },
    {
      image: "/minimalist-natural-interior.png",
      title: "Próximo proyecto",
      location: "Santiago",
      year: "2025",
      description:
        "Concepto en fase inicial para un nuevo espacio comercial en el centro de Santiago, donde se explorarán nuevas formas de interacción entre el cliente y el entorno.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header con navegación */}
      <header className="bg-[#FAFAF8] sticky top-0 z-50 border-b border-[#E8E6E1]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-[#9A9065] font-serif text-3xl font-light">
              Well
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#proyectos" className="text-[#555555] hover:text-[#9A9065] font-light transition-colors">
              Proyectos
            </Link>
            <Link href="#estudio" className="text-[#555555] hover:text-[#9A9065] font-light transition-colors">
              Estudio
            </Link>
            <Link href="#servicios" className="text-[#555555] hover:text-[#9A9065] font-light transition-colors">
              Servicios
            </Link>
            <Link href="#contacto" className="text-[#555555] hover:text-[#9A9065] font-light transition-colors">
              Contacto
            </Link>
            <Link
              href="/quote"
              className="bg-[#9A9065] hover:bg-[#827753] text-white font-light py-2 px-5 rounded-md transition-colors"
            >
              Cotiza tu proyecto
            </Link>
            <Link
              href="/admin/login"
              className="text-[#555555] hover:text-[#9A9065] font-light transition-colors"
              aria-label="Acceso administrador"
            >
              <User size={20} />
            </Link>
          </nav>
          <div className="md:hidden flex items-center">
            <Link
              href="/quote"
              className="bg-[#9A9065] hover:bg-[#827753] text-white font-light py-2 px-4 rounded-md transition-colors text-sm mr-2"
            >
              Cotizar
            </Link>
            <button className="text-[#555555] hover:text-[#9A9065]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 right-0 left-0 bg-white shadow-md p-4 z-50">
              <div className="flex flex-col space-y-4">
                <Link href="#proyectos" className="text-[#555555] hover:text-[#9A9065] font-light transition-colors">
                  Proyectos
                </Link>
                <Link href="#estudio" className="text-[#555555] hover:text-[#9A9065] font-light transition-colors">
                  Estudio
                </Link>
                <Link href="#servicios" className="text-[#555555] hover:text-[#9A9065] font-light transition-colors">
                  Servicios
                </Link>
                <Link href="#contacto" className="text-[#555555] hover:text-[#9A9065] font-light transition-colors">
                  Contacto
                </Link>
                <Link
                  href="/admin/login"
                  className="text-[#555555] hover:text-[#9A9065] font-light transition-colors flex items-center gap-2"
                >
                  <User size={18} /> Admin
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 leading-tight text-[#555555] font-serif">
                Well es un estudio de interiorismo <span className="text-[#9A9065]">empático y multifacético</span>
              </h1>
              <p className="text-lg text-[#555555] mb-8 leading-relaxed font-light">
                Creemos en el poder del diseño como catalizador del bien-estar sistémico y marco para la vida. Nuestra
                estrategia es una combinación de curiosidad, imaginación y empatía, pero más que nada nos basamos en la
                interacción entre los espacios con el aspecto humano y aplicamos este proceso a todo lo que hacemos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/quote"
                  className="bg-[#9A9065] hover:bg-[#827753] text-white font-light py-3 px-8 rounded-md transition-all duration-300 shadow-sm hover:shadow"
                >
                  Cotiza tu proyecto
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </Link>
                <Link
                  href="#proyectos"
                  className="bg-white hover:bg-gray-50 text-[#555555] font-light py-3 px-8 rounded-md border border-[#E8E6E1] transition-colors shadow-sm hover:shadow flex items-center justify-center"
                >
                  Ver proyectos
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative rounded-md overflow-hidden shadow-lg">
                <img
                  src="/minimalist-natural-interior.png"
                  alt="Diseño de interiores por Estudio Well"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <p className="text-white font-light">Verde Sazón — Providencia, Chile</p>
                  <p className="text-[#D4C9A8] text-sm">Diseño de interiores</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Well */}
      <section id="estudio" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-light text-[#555555] mb-8 font-serif">Sobre Well</h2>
            <div className="space-y-6 text-[#555555] font-light">
              <p>
                Buscamos crear espacios que representen el sentir y la identidad del lugar, de forma armoniosa y bajo
                una curatoría fina que se basa en el recorrido y en la forma en que vivimos los espacios. Para nosotras
                un espacio debe ser sensible, ya que leemos nuestro entorno a través de los sentidos.
              </p>
              <p>
                Para lograr esto buscamos que los objetos, texturas y colores se comporten de manera honesta y que no
                compitan entre ellos, sino que cada uno tenga un lugar para hablar sobre sí mismo y entre todos convivan
                de forma balanceada.
              </p>
              <p>
                Nos caracterizamos por una cuidadosa investigación sobre nuestra pasión compartida por el arte, la
                arquitectura y el diseño, donde se priorizan los materiales nobles, las piezas hechas a mano por
                fabricantes y hábiles artesanos, con una honestidad hacia la crudeza y la irregularidad del material
                elegido, creando espacios únicos y auténticos, irrepetibles.
              </p>
              <p>
                Creemos que el diseño no sólo da forma a los espacios que utilizamos día a día, sino también a nuestras
                experiencias en esos espacios. De ahí proviene nuestro nombre Well, del bienestar que buscamos que esté
                presente en todo proceso de diseño.
              </p>
            </div>

            {/* Imagen de las fundadoras trabajando juntas */}
            <div className="mt-12">
              <div className="rounded-lg overflow-hidden shadow-md">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/maca%20y%20cata.jpg-okaSYWXXzH3vT7aM5RRQi3lQornD5f.jpeg"
                  alt="Catalina Soffia y Macarena Whittle, fundadoras de Estudio Well"
                  width={1000}
                  height={667}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-center text-[#9A9065] mt-4 italic">
                "Creemos en el poder transformador del diseño para crear espacios que inspiren bienestar"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-[#555555] mb-12 font-serif">Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-md shadow-sm border border-[#E8E6E1] hover:shadow-md transition-all duration-300">
              <h3 className="text-xl font-medium mb-4 text-[#9A9065]">Diseño de interiores</h3>
              <p className="text-[#555555] font-light">
                Proyectos integrales para espacios comerciales y residenciales. El foco está en desarrollar un concepto
                único según la necesidad de cada cliente, de manera de crear espacios auténticos e irrepetibles.
              </p>
            </div>
            <div className="bg-white p-8 rounded-md shadow-sm border border-[#E8E6E1] hover:shadow-md transition-all duration-300">
              <h3 className="text-xl font-medium mb-4 text-[#9A9065]">Branding</h3>
              <p className="text-[#555555] font-light">
                Investigación de mercado, definición de misión y visión, diseño de logotipo y elementos visuales, además
                de estrategias de comunicación para conectar emocionalmente con el público y diferenciarse de la
                competencia.
              </p>
            </div>
            <div className="bg-white p-8 rounded-md shadow-sm border border-[#E8E6E1] hover:shadow-md transition-all duration-300">
              <h3 className="text-xl font-medium mb-4 text-[#9A9065]">Asesorías de decoración</h3>
              <p className="text-[#555555] font-light">
                Proyectos de corto plazo que ayudan a ordenar ideas y tomar decisiones de compra con mayor seguridad
                según gustos y forma de habitar los espacios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-[#555555] mb-12 font-serif">Equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="aspect-square rounded-md overflow-hidden">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cata-leotGWFiUkhGmInYvnSUcqss5VB6GD.jpeg"
                    alt="Catalina Soffia"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-medium mb-2 text-[#9A9065]">Catalina Soffia</h3>
                <p className="text-[#555555] font-light">
                  Diseñadora, directora creativa y fundadora de Estudio Well. Vivió tres años en Europa (Dinamarca y
                  España) trabajando en retail; hoy es Directora Creativa para Yanéken. Diseñadora interdisciplinaria
                  con experiencia en branding, diseño de objetos e interiorismo. Destaca su colección de sillas "Fole",
                  exhibida en Copenhague y Tokio. Actualmente desarrolla proyectos de tiendas, rebrandings y productos
                  en el grupo Yaneken.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="aspect-square rounded-md overflow-hidden">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/maca.jpg-wT6HYwEwcVeojRtXSEU8w3VKjpKSDm.jpeg"
                    alt="Macarena Whittle"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-medium mb-2 text-[#9A9065]">Macarena Whittle</h3>
                <p className="text-[#555555] font-light">
                  Diseñadora, fotógrafa y fundadora de Estudio Well. Trabajó más de tres años en Koskela (Sídney),
                  profundizando en diseño excepcional y fabricación local. En Chile fue Directora de Arte en La Casa de
                  Juana, recorriendo la mejor arquitectura de Santiago y el diseño local. Aporta visión global,
                  innovación integral y altos estándares de calidad a cada proyecto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proyectos destacados */}
      <section id="proyectos" className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-[#555555] mb-12 font-serif">Proyectos destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all duration-300 bg-white"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-[#D4C9A8] text-sm">{project.location}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-[#555555] mb-1">{project.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#9A9065]">{project.year}</span>
                    <button
                      onClick={() => setSelectedProject(index)}
                      className="text-[#9A9065] hover:text-[#827753] font-medium text-sm flex items-center"
                    >
                      Ver detalles
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de proyecto */}
      {selectedProject !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-start border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-light text-[#555555] font-serif">{projects[selectedProject].title}</h3>
                <p className="text-[#9A9065]">
                  {projects[selectedProject].location}, {projects[selectedProject].year}
                </p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 rounded-md overflow-hidden">
                <img
                  src={projects[selectedProject].image || "/placeholder.svg"}
                  alt={projects[selectedProject].title}
                  className="w-full h-auto"
                />
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-[#9A9065]">Descripción del proyecto</h4>
                <p className="text-[#555555] font-light">{projects[selectedProject].description}</p>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-[#9A9065] mb-4">Galería de imágenes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={projects[selectedProject].image || "/placeholder.svg"}
                        alt={`${projects[selectedProject].title} - Vista 1`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={projects[selectedProject].image || "/placeholder.svg"}
                        alt={`${projects[selectedProject].title} - Vista 2`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    href="/quote"
                    className="inline-block bg-[#9A9065] hover:bg-[#827753] text-white font-light py-2 px-6 rounded-md transition-colors"
                  >
                    Cotiza un proyecto similar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-20 bg-[#9A9065] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-light mb-6 font-serif">¿Listo para transformar tu espacio?</h2>
            <p className="text-lg text-[#F0EBD8] mb-8 font-light">
              Obtén una cotización personalizada para tu proyecto y comienza a crear un espacio que refleje tu
              identidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="bg-white text-[#9A9065] hover:bg-gray-100 font-light py-3 px-8 rounded-md transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center"
              >
                Cotiza tu proyecto
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#contacto"
                className="bg-[#827753] hover:bg-[#706548] text-white font-light py-3 px-8 rounded-md transition-colors shadow-sm hover:shadow flex items-center justify-center"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-[#555555] mb-12 font-serif">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="bg-[#FAFAF8] p-8 rounded-md border border-[#E8E6E1] h-full">
                <h3 className="text-xl font-medium mb-6 text-[#9A9065]">Información de contacto</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-[#F0EBD8] rounded-full p-3 mr-4">
                      <MapPin className="h-5 w-5 text-[#9A9065]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#555555] mb-1">Ciudad</p>
                      <p className="text-[#555555] font-light">Santiago, Chile</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#F0EBD8] rounded-full p-3 mr-4">
                      <Mail className="h-5 w-5 text-[#9A9065]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#555555] mb-1">Email</p>
                      <a href="mailto:estudiowell.info@gmail.com" className="text-[#9A9065] hover:text-[#827753]">
                        estudiowell.info@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#F0EBD8] rounded-full p-3 mr-4">
                      <Phone className="h-5 w-5 text-[#9A9065]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#555555] mb-1">Teléfono/WhatsApp</p>
                      <a href="tel:+56958665263" className="text-[#9A9065] hover:text-[#827753]">
                        +56 9 5866 5263
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-medium text-[#555555] mb-3">Síguenos</h4>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.instagram.com/estudiowell"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#F0EBD8] hover:bg-[#E8E6E1] text-[#9A9065] h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Instagram"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.linkedin.com/company/estudio-well"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#F0EBD8] hover:bg-[#E8E6E1] text-[#9A9065] h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <form onSubmit={handleContactSubmit} className="bg-[#FAFAF8] p-8 rounded-md border border-[#E8E6E1]">
                <h3 className="text-xl font-medium mb-6 text-[#9A9065]">Envíanos un mensaje</h3>

                {formStatus.status === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                    {formStatus.message}
                  </div>
                )}

                {formStatus.status === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                    {formStatus.message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="nombre" className="block text-[#555555] font-medium mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={contactForm.nombre}
                      onChange={handleContactInputChange}
                      className="w-full px-4 py-3 rounded-md border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#9A9065] focus:border-transparent"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[#555555] font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactInputChange}
                      className="w-full px-4 py-3 rounded-md border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#9A9065] focus:border-transparent"
                      placeholder="Tu email"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="telefono" className="block text-[#555555] font-medium mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={contactForm.telefono}
                    onChange={handleContactInputChange}
                    className="w-full px-4 py-3 rounded-md border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#9A9065] focus:border-transparent"
                    placeholder="Tu teléfono"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="asunto" className="block text-[#555555] font-medium mb-2">
                    Asunto
                  </label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={contactForm.asunto}
                    onChange={handleContactInputChange}
                    className="w-full px-4 py-3 rounded-md border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#9A9065] focus:border-transparent"
                    placeholder="Asunto de tu mensaje"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="mensaje" className="block text-[#555555] font-medium mb-2">
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={contactForm.mensaje}
                    onChange={handleContactInputChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-md border border-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#9A9065] focus:border-transparent"
                    placeholder="Cuéntanos sobre tu proyecto..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={formStatus.status === "loading"}
                  className="w-full bg-[#9A9065] hover:bg-[#827753] text-white font-light py-3 px-4 rounded-md transition-colors shadow-sm hover:shadow flex items-center justify-center"
                >
                  {formStatus.status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar mensaje"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#555555] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="text-white font-serif text-2xl font-light">
                Well
              </Link>
              <p className="mt-2 text-sm text-gray-300 font-light">
                Estudio Well® – Interiorismo empático y multifacético. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <Link href="/quote" className="text-gray-300 hover:text-white transition-colors font-light">
                Cotiza tu proyecto
              </Link>
              <Link href="/admin/login" className="text-gray-300 hover:text-white transition-colors font-light">
                Acceso Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

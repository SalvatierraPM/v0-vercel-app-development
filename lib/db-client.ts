import { createClient } from "@/lib/supabase/client"

// Cliente de Supabase para el lado del cliente
const supabase = createClient()

// Funciones de base de datos seguras para el lado del cliente
export async function getCotizaciones() {
  const { data, error } = await supabase.from("cotizaciones").select("*").order("created_at", { ascending: false })
  return { cotizaciones: data, error }
}

export async function getCotizacionById(id: string) {
  const { data, error } = await supabase.from("cotizaciones").select("*").eq("id", id).single()
  return { cotizacion: data, error }
}

export async function updateCotizacion(id: string, updates: any) {
  const { data, error } = await supabase.from("cotizaciones").update(updates).eq("id", id).select().single()
  return { cotizacion: data, error }
}

export async function getProyectos() {
  const { data, error } = await supabase.from("proyectos").select("*").order("created_at", { ascending: false })
  return { proyectos: data, error }
}

export async function getProyectoById(id: string) {
  const { data, error } = await supabase.from("proyectos").select("*").eq("id", id).single()
  return { proyecto: data, error }
}

export async function createProyecto(proyecto: any) {
  const { data, error } = await supabase.from("proyectos").insert(proyecto).select().single()
  return { proyecto: data, error }
}

export async function getAdminUsers() {
  const { data, error } = await supabase.from("admin_users").select("*")
  return { usuarios: data, error }
}

export async function getArchivosCotizacion(cotizacionId: string) {
  const { data, error } = await supabase
    .from("archivos_cotizacion")
    .select("*")
    .eq("cotizacion_id", cotizacionId)
    .order("created_at", { ascending: false })
  return { archivos: data, error }
}

export async function getComentariosCotizacion(cotizacionId: string) {
  const { data, error } = await supabase
    .from("comentarios_cotizacion")
    .select("*")
    .eq("cotizacion_id", cotizacionId)
    .order("created_at", { ascending: false })
  return { comentarios: data, error }
}

export async function getTareasCotizacion(cotizacionId: string) {
  const { data, error } = await supabase
    .from("tareas_cotizacion")
    .select("*")
    .eq("cotizacion_id", cotizacionId)
    .order("created_at", { ascending: false })
  return { tareas: data, error }
}

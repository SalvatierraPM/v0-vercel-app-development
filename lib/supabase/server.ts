import { createServerComponentClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Importar cookies de manera dinámica para evitar problemas con el directorio pages/
let cookies: any
try {
  // Intentar importar cookies de next/headers
  cookies = require("next/headers").cookies
} catch (error) {
  // Si falla, proporcionar una función que lance un error
  cookies = () => {
    throw new Error("cookies() from next/headers is not available in the pages/ directory")
  }
}

// Cliente de Supabase para componentes del lado del servidor (solo para app/)
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Cliente de Supabase para acciones del servidor (solo para app/)
export const createActionClient = () => {
  return createServerActionClient<Database>({ cookies })
}

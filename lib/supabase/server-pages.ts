import { createServerComponentClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Versión segura para pages/ que no importa next/headers directamente
export const createServerClient = (cookiesObj: any) => {
  return createServerComponentClient<Database>({ cookies: cookiesObj })
}

// Versión segura para pages/ que no importa next/headers directamente
export const createActionClient = (cookiesObj: any) => {
  return createServerActionClient<Database>({ cookies: cookiesObj })
}

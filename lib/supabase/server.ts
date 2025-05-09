import { createServerComponentClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

// Cliente de Supabase para componentes del lado del servidor (solo para app/)
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Cliente de Supabase para acciones del servidor (solo para app/)
export const createActionClient = () => {
  return createServerActionClient<Database>({ cookies })
}

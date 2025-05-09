import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Cliente de Supabase para componentes del lado del cliente (compatible con pages/)
export const createClient = () => {
  return createClientComponentClient<Database>()
}

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

export const createServerClientForPages = (cookieStore: any) => {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import type { NextRequest, NextResponse } from "next/server"
import type { Database } from "./database.types"

// Cliente de Supabase para middleware
export const supabaseMiddlewareClient = (req: NextRequest, res: NextResponse) => {
  return createMiddlewareClient<Database>({ req, res })
}

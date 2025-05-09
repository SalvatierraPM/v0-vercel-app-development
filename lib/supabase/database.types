export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      cotizaciones: {
        Row: {
          id: string
          created_at: string
          nombre: string
          email: string
          telefono: string | null
          tipo_espacio: string
          metros_cuadrados: number
          estado: string
          alcance: string
          urgencia: string
          presupuesto: string | null
          cotizacion_uf_min: number
          cotizacion_uf_max: number
          cotizacion_clp_min: number
          cotizacion_clp_max: number
        }
        Insert: {
          id?: string
          created_at?: string
          nombre: string
          email: string
          telefono?: string | null
          tipo_espacio: string
          metros_cuadrados: number
          estado: string
          alcance: string
          urgencia: string
          presupuesto?: string | null
          cotizacion_uf_min: number
          cotizacion_uf_max: number
          cotizacion_clp_min: number
          cotizacion_clp_max: number
        }
        Update: {
          id?: string
          created_at?: string
          nombre?: string
          email?: string
          telefono?: string | null
          tipo_espacio?: string
          metros_cuadrados?: number
          estado?: string
          alcance?: string
          urgencia?: string
          presupuesto?: string | null
          cotizacion_uf_min?: number
          cotizacion_uf_max?: number
          cotizacion_clp_min?: number
          cotizacion_clp_max?: number
        }
      }
      archivos_cotizacion: {
        Row: {
          id: string
          cotizacion_id: string
          created_at: string
          url: string
          nombre: string
        }
        Insert: {
          id?: string
          cotizacion_id: string
          created_at?: string
          url: string
          nombre: string
        }
        Update: {
          id?: string
          cotizacion_id?: string
          created_at?: string
          url?: string
          nombre?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          created_at: string
          role: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          role?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          role?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

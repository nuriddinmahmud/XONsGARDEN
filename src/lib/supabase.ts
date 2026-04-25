import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim()
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY ?? '').trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      'Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY.',
    )
  }

  return supabase
}

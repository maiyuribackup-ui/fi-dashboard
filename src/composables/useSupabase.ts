import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
}

let supabaseInstance: SupabaseClient | null = null

export function useSupabase() {
  if (!supabaseInstance && supabaseUrl && supabaseKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey)
  }

  const userId = import.meta.env.VITE_USER_ID || 'ram_kumaran'
  const fiTarget = Number(import.meta.env.VITE_FI_TARGET) || 200000

  return {
    supabase: supabaseInstance!,
    userId,
    fiTarget,
  }
}

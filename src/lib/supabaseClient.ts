import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// True once both env vars are set (see .env.example / SETUP.md). Everything
// in dataClient.ts checks this before touching Supabase, so the app keeps
// running on local mock data until a real project is wired in.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null

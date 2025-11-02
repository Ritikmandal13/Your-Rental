import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gmnfsaykorpqtsprggpc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbmZzYXlrb3JwcXRzcHJnZ3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTA0MDgsImV4cCI6MjA3NzU2NjQwOH0.dAzBF_966p2-wo7qTs7Ry3wKKbHIZi3xfWrQ-680DZY'

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side Supabase client helper
export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// User role type
export type UserRole = 'user' | 'rent_provider'


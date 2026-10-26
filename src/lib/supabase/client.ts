import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_URL

const supabaseUrl =
  rawUrl && !rawUrl.includes('your-project-id') && !rawUrl.includes('YOUR_PROJECT_REF')
    ? rawUrl
    : 'https://lamhjuvvpqspbjpkozaq.supabase.co'

const keyCandidates = [
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_ANON_KEY,
]

const supabaseKey =
  keyCandidates.find((k) => k && !k.includes('your_key_here') && k.length > 10) ||
  'sb_publishable_C4ueCvthPK5aCrb_DsinpA_MxZgjIvm'

/**
 * Checks whether Supabase environment variables are configured.
 * When false, the application safely operates in offline demo mode.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'))
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

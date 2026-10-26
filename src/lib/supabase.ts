import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env as unknown as Record<string, string | undefined>)
    : typeof process !== 'undefined' && process.env
    ? (process.env as unknown as Record<string, string | undefined>)
    : {}

const rawUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const url =
  rawUrl && !rawUrl.includes('your-project-id') && !rawUrl.includes('YOUR_PROJECT_REF')
    ? rawUrl
    : 'https://lamhjuvvpqspbjpkozaq.supabase.co'

const candidates = [
  env.VITE_SUPABASE_ANON_KEY,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
]
const anonKey =
  candidates.find((k) => k && !k.includes('your_key_here') && k.length > 10) ||
  'sb_publishable_C4ueCvthPK5aCrb_DsinpA_MxZgjIvm'

/** False when env vars are missing; cloud features then show a setup notice. */
export const cloudConfigured = Boolean(url && anonKey && url.startsWith('http'))

export const supabase: SupabaseClient | null = cloudConfigured
  ? createClient(url as string, anonKey as string)
  : null

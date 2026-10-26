/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORY_AI_ENDPOINT?: string
  readonly VITE_STORY_AI_MODEL_NAME?: string
  readonly VITE_IMAGE_AI_ENDPOINT?: string
  readonly VITE_LOCAL_IMAGE_MODEL_NAME?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
}

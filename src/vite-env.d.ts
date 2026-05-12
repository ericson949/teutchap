/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_MAX_PHOTOS_FREE?: string
  readonly VITE_MAX_PHOTOS_PREMIUM?: string
  readonly VITE_MAX_PHOTOS_VIP?: string
  readonly VITE_USER_MAX_PHOTOS_FREE?: string
  readonly VITE_USER_MAX_PHOTOS_PREMIUM?: string
  readonly VITE_USER_MAX_PHOTOS_VIP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

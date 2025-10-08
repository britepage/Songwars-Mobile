/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_STORAGE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_DEV_MODE: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_MAX_RETRIES: string
  readonly VITE_ENABLE_PUSH_NOTIFICATIONS: string
  readonly VITE_ENABLE_BIOMETRIC_AUTH: string
  readonly VITE_ENABLE_OFFLINE_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


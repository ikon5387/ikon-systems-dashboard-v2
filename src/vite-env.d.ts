/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_VAPI_API_KEY?: string
  readonly VITE_TWILIO_ACCOUNT_SID?: string
  readonly VITE_TWILIO_AUTH_TOKEN?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_GOOGLE_CALENDAR_CLIENT_ID?: string
  readonly VITE_SENTRY_DSN?: string
  readonly NODE_ENV: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

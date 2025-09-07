import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  VITE_VAPI_API_KEY: z.string().optional(),
  VITE_TWILIO_ACCOUNT_SID: z.string().optional(),
  VITE_TWILIO_AUTH_TOKEN: z.string().optional(),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  VITE_GOOGLE_CALENDAR_CLIENT_ID: z.string().optional(),
  VITE_SENTRY_DSN: z.string().optional(),
})

function validateEnv() {
  try {
    const env = import.meta.env
    
    // Check if we're in a build environment where env vars might not be loaded yet
    if (!env.VITE_SUPABASE_URL && !env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Environment variables not loaded. Using fallback configuration.')
      
      // Return a fallback configuration for build time
      return {
        VITE_SUPABASE_URL: 'https://drmloijaajtzkvdclwmf.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRybWxvaWphYWp0emt2ZGNsd21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjgzMjMsImV4cCI6MjA3MjEwNDMyM30.axIWyuz9yvSaQgW-l-iMjwSAsNKcllyLSlv3Aj4zatY',
        VITE_VAPI_API_KEY: undefined,
        VITE_TWILIO_ACCOUNT_SID: undefined,
        VITE_TWILIO_AUTH_TOKEN: undefined,
        VITE_STRIPE_PUBLISHABLE_KEY: undefined,
        VITE_GOOGLE_CALENDAR_CLIENT_ID: undefined,
        VITE_SENTRY_DSN: undefined,
      }
    }
    
    return envSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ')
      console.error(`Missing or invalid environment variables: ${missingVars}`)
      
      // In development, show a helpful error
      if (import.meta.env.DEV) {
        throw new Error(`Missing environment variables: ${missingVars}. Please check your .env file.`)
      }
      
      // In production, use fallback values
      return {
        VITE_SUPABASE_URL: 'https://drmloijaajtzkvdclwmf.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRybWxvaWphYWp0emt2ZGNsd21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjgzMjMsImV4cCI6MjA3MjEwNDMyM30.axIWyuz9yvSaQgW-l-iMjwSAsNKcllyLSlv3Aj4zatY',
        VITE_VAPI_API_KEY: undefined,
        VITE_TWILIO_ACCOUNT_SID: undefined,
        VITE_TWILIO_AUTH_TOKEN: undefined,
        VITE_STRIPE_PUBLISHABLE_KEY: undefined,
        VITE_GOOGLE_CALENDAR_CLIENT_ID: undefined,
        VITE_SENTRY_DSN: undefined,
      }
    }
    throw error
  }
}

export const env = validateEnv()

export const config = {
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
  },
  integrations: {
    vapi: {
      apiKey: env.VITE_VAPI_API_KEY,
      enabled: Boolean(env.VITE_VAPI_API_KEY && env.VITE_VAPI_API_KEY !== 'your_vapi_api_key'),
    },
    twilio: {
      accountSid: env.VITE_TWILIO_ACCOUNT_SID,
      authToken: env.VITE_TWILIO_AUTH_TOKEN,
      enabled: Boolean(
        env.VITE_TWILIO_ACCOUNT_SID && 
        env.VITE_TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid' &&
        env.VITE_TWILIO_AUTH_TOKEN && 
        env.VITE_TWILIO_AUTH_TOKEN !== 'your_twilio_auth_token'
      ),
    },
    stripe: {
      publishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY,
      enabled: Boolean(
        env.VITE_STRIPE_PUBLISHABLE_KEY && 
        env.VITE_STRIPE_PUBLISHABLE_KEY !== 'your_stripe_publishable_key'
      ),
    },
    googleCalendar: {
      clientId: env.VITE_GOOGLE_CALENDAR_CLIENT_ID,
      enabled: Boolean(
        env.VITE_GOOGLE_CALENDAR_CLIENT_ID && 
        env.VITE_GOOGLE_CALENDAR_CLIENT_ID !== 'your_google_calendar_client_id'
      ),
    },
  },
  sentry: {
    dsn: env.VITE_SENTRY_DSN,
    enabled: Boolean(env.VITE_SENTRY_DSN && env.VITE_SENTRY_DSN !== 'your_sentry_dsn'),
  },
  app: {
    name: 'Ikon Systems Dashboard',
    version: '1.0.0',
    environment: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },
}

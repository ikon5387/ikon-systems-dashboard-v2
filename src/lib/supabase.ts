import { createClient } from '@supabase/supabase-js'
import { config } from './env'

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Remove pkce flow type as it might be causing issues
    storageKey: 'ikon-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': config.app.name,
    }
  },
})

// Debug: Log Supabase client initialization
console.log('🔐 Supabase client initialized:', {
  url: config.supabase.url,
  hasAnonKey: !!config.supabase.anonKey,
  appName: config.app.name
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'sales' | 'support'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'sales' | 'support'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'sales' | 'support'
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          status: 'lead' | 'prospect' | 'active' | 'churned'
          bilingual_preference: boolean
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          status?: 'lead' | 'prospect' | 'active' | 'churned'
          bilingual_preference?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          status?: 'lead' | 'prospect' | 'active' | 'churned'
          bilingual_preference?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          date_time: string
          title: string | null
          description: string | null
          type: 'demo' | 'call' | 'follow_up' | 'meeting' | 'consultation'
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
          duration: number | null
          location: string | null
          google_calendar_id: string | null
          scheduled_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          date_time: string
          title?: string | null
          description?: string | null
          type?: 'demo' | 'call' | 'follow_up' | 'meeting' | 'consultation'
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
          duration?: number | null
          location?: string | null
          google_calendar_id?: string | null
          scheduled_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          date_time?: string
          title?: string | null
          description?: string | null
          type?: 'demo' | 'call' | 'follow_up' | 'meeting' | 'consultation'
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
          duration?: number | null
          location?: string | null
          google_calendar_id?: string | null
          scheduled_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string
          status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          budget: number
          timeline: string
          milestones: any
          start_date: string | null
          due_date: string | null
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description: string
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          budget: number
          timeline: string
          milestones?: any
          start_date?: string | null
          due_date?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          budget?: number
          timeline?: string
          milestones?: any
          start_date?: string | null
          due_date?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      voice_agents: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'sales' | 'support' | 'appointment' | 'follow_up' | 'custom'
          status: 'active' | 'inactive' | 'training' | 'error'
          model: string
          voice: string
          first_message: string
          system_message: string
          max_duration: number
          webhook_url: string | null
          language: string
          temperature: number
          max_tokens: number
          total_calls: number
          average_call_duration: number
          success_rate: number
          conversion_rate: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type?: 'sales' | 'support' | 'appointment' | 'follow_up' | 'custom'
          status?: 'active' | 'inactive' | 'training' | 'error'
          model?: string
          voice?: string
          first_message: string
          system_message: string
          max_duration?: number
          webhook_url?: string | null
          language?: string
          temperature?: number
          max_tokens?: number
          total_calls?: number
          average_call_duration?: number
          success_rate?: number
          conversion_rate?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'sales' | 'support' | 'appointment' | 'follow_up' | 'custom'
          status?: 'active' | 'inactive' | 'training' | 'error'
          model?: string
          voice?: string
          first_message?: string
          system_message?: string
          max_duration?: number
          webhook_url?: string | null
          language?: string
          temperature?: number
          max_tokens?: number
          total_calls?: number
          average_call_duration?: number
          success_rate?: number
          conversion_rate?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      financials: {
        Row: {
          id: string
          client_id: string
          project_id: string | null
          invoice_id: string
          amount: number
          status: 'pending' | 'paid' | 'overdue'
          payment_method: string
          transaction_logs: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          project_id?: string | null
          invoice_id: string
          amount: number
          status?: 'pending' | 'paid' | 'overdue'
          payment_method?: string
          transaction_logs?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          project_id?: string | null
          invoice_id?: string
          amount?: number
          status?: 'pending' | 'paid' | 'overdue'
          payment_method?: string
          transaction_logs?: any
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string
          project_id: string | null
          title: string
          description: string | null
          amount: number
          tax_rate: number
          total_amount: number
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          client_id: string
          project_id?: string | null
          title: string
          description?: string | null
          amount: number
          tax_rate?: number
          total_amount: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          client_id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          amount?: number
          tax_rate?: number
          total_amount?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_method: string
          payment_date: string
          reference_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_method: string
          payment_date: string
          reference_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_method?: string
          payment_date?: string
          reference_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          title: string
          description: string | null
          amount: number
          category: string
          expense_date: string
          receipt_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          amount: number
          category: string
          expense_date: string
          receipt_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          amount?: number
          category?: string
          expense_date?: string
          receipt_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          business_info: any
          api_keys: any
          user_preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_info?: any
          api_keys?: any
          user_preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_info?: any
          api_keys?: any
          user_preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      logs: {
        Row: {
          id: string
          user_id: string
          action: string
          details: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          details?: any
          created_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 
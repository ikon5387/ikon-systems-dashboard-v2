import { BaseService, ServiceResponse, FilterParams, PaginationParams } from '../base/BaseService'
import { supabase } from '@/lib/supabase'
import type { Tables, InsertDto, UpdateDto } from '@/lib/supabase'

export type Appointment = Tables<'appointments'>
export type AppointmentInsert = InsertDto<'appointments'>
export type AppointmentUpdate = UpdateDto<'appointments'>

export interface AppointmentFilters extends FilterParams {
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  type?: 'demo' | 'call' | 'meeting' | 'follow_up' | 'consultation'
  client_id?: string
  date_from?: string
  date_to?: string
  title_search?: string
}

export interface AppointmentStats {
  total: number
  scheduled: number
  confirmed: number
  completed: number
  cancelled: number
  rescheduled: number
  today: number
  thisWeek: number
  overdue: number
}

export interface AppointmentWithClient extends Appointment {
  client: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

class AppointmentServiceClass extends BaseService {
  protected tableName = 'appointments'

  async getAppointments(filters?: AppointmentFilters, pagination?: PaginationParams): Promise<ServiceResponse<AppointmentWithClient[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .order('scheduled_at', { ascending: true })

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.type) {
          query = query.eq('type', filters.type)
        }
        if (filters.client_id) {
          query = query.eq('client_id', filters.client_id)
        }
        if (filters.date_from) {
          query = query.gte('scheduled_at', filters.date_from)
        }
        if (filters.date_to) {
          query = query.lte('scheduled_at', filters.date_to)
        }
        if (filters.title_search) {
          query = query.ilike('title', `%${filters.title_search}%`)
        }
      }

      // Apply pagination
      if (pagination) {
        const { page = 1, limit = 10 } = pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching appointments:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getAppointments:', error)
      return { data: null, error: 'Failed to fetch appointments', success: false }
    }
  }

  async getAppointment(id: string): Promise<ServiceResponse<AppointmentWithClient>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching appointment:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in getAppointment:', error)
      return { data: null, error: 'Failed to fetch appointment', success: false }
    }
  }

  async createAppointment(appointmentData: AppointmentInsert): Promise<ServiceResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(appointmentData)
        .select()
        .single()

      if (error) {
        console.error('Error creating appointment:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in createAppointment:', error)
      return { data: null, error: 'Failed to create appointment', success: false }
    }
  }

  async updateAppointment(id: string, updates: AppointmentUpdate): Promise<ServiceResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating appointment:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in updateAppointment:', error)
      return { data: null, error: 'Failed to update appointment', success: false }
    }
  }

  async deleteAppointment(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting appointment:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: true, error: null, success: true }
    } catch (error) {
      console.error('Error in deleteAppointment:', error)
      return { data: null, error: 'Failed to delete appointment', success: false }
    }
  }

  async getAppointmentStats(): Promise<ServiceResponse<AppointmentStats>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, scheduled_at')

      if (error) {
        console.error('Error fetching appointment stats:', error)
        return { data: null, error: error.message, success: false }
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const stats: AppointmentStats = {
        total: data.length,
        scheduled: data.filter(a => a.status === 'scheduled').length,
        confirmed: data.filter(a => a.status === 'confirmed').length,
        completed: data.filter(a => a.status === 'completed').length,
        cancelled: data.filter(a => a.status === 'cancelled').length,
        rescheduled: data.filter(a => a.status === 'rescheduled').length,
        today: data.filter(a => {
          const appointmentDate = new Date(a.scheduled_at)
          return appointmentDate >= today && appointmentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }).length,
        thisWeek: data.filter(a => {
          const appointmentDate = new Date(a.scheduled_at)
          return appointmentDate >= weekStart && appointmentDate <= weekEnd
        }).length,
        overdue: data.filter(a => {
          const appointmentDate = new Date(a.scheduled_at)
          return appointmentDate < now && a.status !== 'completed' && a.status !== 'cancelled'
        }).length
      }

      return { data: stats, error: null, success: true }
    } catch (error) {
      console.error('Error in getAppointmentStats:', error)
      return { data: null, error: 'Failed to fetch appointment stats', success: false }
    }
  }

  async getTodaysAppointments(): Promise<ServiceResponse<AppointmentWithClient[]>> {
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .gte('scheduled_at', startOfDay.toISOString())
        .lt('scheduled_at', endOfDay.toISOString())
        .order('scheduled_at', { ascending: true })

      if (error) {
        console.error('Error fetching today\'s appointments:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getTodaysAppointments:', error)
      return { data: null, error: 'Failed to fetch today\'s appointments', success: false }
    }
  }

  async getUpcomingAppointments(limit: number = 5): Promise<ServiceResponse<AppointmentWithClient[]>> {
    try {
      const now = new Date()

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .gte('scheduled_at', now.toISOString())
        .in('status', ['scheduled', 'confirmed'])
        .order('scheduled_at', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching upcoming appointments:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getUpcomingAppointments:', error)
      return { data: null, error: 'Failed to fetch upcoming appointments', success: false }
    }
  }

  async searchAppointments(query: string): Promise<ServiceResponse<AppointmentWithClient[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('scheduled_at', { ascending: true })
        .limit(20)

      if (error) {
        console.error('Error searching appointments:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in searchAppointments:', error)
      return { data: null, error: 'Failed to search appointments', success: false }
    }
  }

  // Google Calendar Integration
  async syncWithGoogleCalendar(appointmentId: string): Promise<ServiceResponse<boolean>> {
    try {
      // This would integrate with Google Calendar API
      // For now, we'll just mark it as synced
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          google_calendar_id: `gc_${appointmentId}_${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (error) {
        console.error('Error syncing with Google Calendar:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: true, error: null, success: true }
    } catch (error) {
      console.error('Error in syncWithGoogleCalendar:', error)
      return { data: null, error: 'Failed to sync with Google Calendar', success: false }
    }
  }

  // Real-time subscriptions
  subscribeToAppointments(callback: (payload: any) => void) {
    return supabase
      .channel('appointments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, callback)
      .subscribe()
  }

  subscribeToAppointmentStats(callback: (payload: any) => void) {
    return supabase
      .channel('appointment_stats_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, callback)
      .subscribe()
  }
}

export const AppointmentService = new AppointmentServiceClass()

import { BaseService, ServiceResponse, FilterParams, PaginationParams } from '../base/BaseService'
import { supabase } from '@/lib/supabase'
import type { Tables, InsertDto, UpdateDto } from '@/lib/supabase'

export type Client = Tables<'clients'>
export type ClientInsert = InsertDto<'clients'>
export type ClientUpdate = UpdateDto<'clients'>

export interface ClientFilters extends FilterParams {
  status?: 'lead' | 'prospect' | 'active' | 'churned'
  bilingual_preference?: boolean
  name_search?: string
  email_search?: string
  phone_search?: string
}

export interface ClientStats {
  total: number
  leads: number
  prospects: number
  active: number
  churned: number
  bilingualClients: number
  recentlyAdded: number
}

class ClientServiceClass extends BaseService {
  protected tableName = 'clients'

  async getClients(filters?: ClientFilters, pagination?: PaginationParams): Promise<ServiceResponse<Client[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.bilingual_preference !== undefined) {
          query = query.eq('bilingual_preference', filters.bilingual_preference)
        }
        if (filters.name_search) {
          query = query.ilike('name', `%${filters.name_search}%`)
        }
        if (filters.email_search) {
          query = query.ilike('email', `%${filters.email_search}%`)
        }
        if (filters.phone_search) {
          query = query.ilike('phone', `%${filters.phone_search}%`)
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
        console.error('Error fetching clients:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getClients:', error)
      return { data: null, error: 'Failed to fetch clients', success: false }
    }
  }

  async getClient(id: string): Promise<ServiceResponse<Client>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching client:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in getClient:', error)
      return { data: null, error: 'Failed to fetch client', success: false }
    }
  }

  async createClient(clientData: ClientInsert): Promise<ServiceResponse<Client>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(clientData)
        .select()
        .single()

      if (error) {
        console.error('Error creating client:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in createClient:', error)
      return { data: null, error: 'Failed to create client', success: false }
    }
  }

  async updateClient(id: string, updates: ClientUpdate): Promise<ServiceResponse<Client>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating client:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in updateClient:', error)
      return { data: null, error: 'Failed to update client', success: false }
    }
  }

  async deleteClient(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting client:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: true, error: null, success: true }
    } catch (error) {
      console.error('Error in deleteClient:', error)
      return { data: null, error: 'Failed to delete client', success: false }
    }
  }

  async getClientStats(): Promise<ServiceResponse<ClientStats>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, bilingual_preference, created_at')

      if (error) {
        console.error('Error fetching client stats:', error)
        return { data: null, error: error.message, success: false }
      }

      const stats: ClientStats = {
        total: data.length,
        leads: data.filter(c => c.status === 'lead').length,
        prospects: data.filter(c => c.status === 'prospect').length,
        active: data.filter(c => c.status === 'active').length,
        churned: data.filter(c => c.status === 'churned').length,
        bilingualClients: data.filter(c => c.bilingual_preference).length,
        recentlyAdded: data.filter(c => {
          const createdDate = new Date(c.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return createdDate > weekAgo
        }).length
      }

      return { data: stats, error: null, success: true }
    } catch (error) {
      console.error('Error in getClientStats:', error)
      return { data: null, error: 'Failed to fetch client stats', success: false }
    }
  }

  async searchClients(query: string): Promise<ServiceResponse<Client[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error searching clients:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in searchClients:', error)
      return { data: null, error: 'Failed to search clients', success: false }
    }
  }

  async getRecentClients(limit: number = 5): Promise<ServiceResponse<Client[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent clients:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getRecentClients:', error)
      return { data: null, error: 'Failed to fetch recent clients', success: false }
    }
  }

  async getClientsByStatus(status: 'lead' | 'prospect' | 'active' | 'churned'): Promise<ServiceResponse<Client[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clients by status:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getClientsByStatus:', error)
      return { data: null, error: 'Failed to fetch clients by status', success: false }
    }
  }

  // Real-time subscriptions
  subscribeToClients(callback: (payload: any) => void) {
    return supabase
      .channel('clients_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients'
      }, callback)
      .subscribe()
  }

  subscribeToClientStats(callback: (payload: any) => void) {
    return supabase
      .channel('client_stats_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients'
      }, callback)
      .subscribe()
  }
}

export const ClientService = new ClientServiceClass()

import { BaseService, ServiceResponse, FilterParams, PaginationParams } from '../base/BaseService'
import { supabase } from '@/lib/supabase'
import type { Tables, InsertDto, UpdateDto } from '@/lib/supabase'

export type VoiceAgent = Tables<'voice_agents'>
export type VoiceAgentInsert = InsertDto<'voice_agents'>
export type VoiceAgentUpdate = UpdateDto<'voice_agents'>

export interface VoiceAgentFilters extends FilterParams {
  status?: 'active' | 'inactive' | 'training' | 'error'
  type?: 'sales' | 'support' | 'appointment' | 'follow_up' | 'custom'
  name_search?: string
  description_search?: string
}

export interface VoiceAgentStats {
  total: number
  active: number
  inactive: number
  training: number
  error: number
  totalCalls: number
  successfulCalls: number
  averageCallDuration: number
  conversionRate: number
}

export interface VoiceAgentCall {
  id: string
  agent_id: string
  client_id?: string
  phone_number: string
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer'
  duration?: number
  recording_url?: string
  transcript?: string
  outcome?: string
  created_at: string
  updated_at: string
}

class VoiceAgentServiceClass extends BaseService {
  protected tableName = 'voice_agents'

  async getVoiceAgents(filters?: VoiceAgentFilters, pagination?: PaginationParams): Promise<ServiceResponse<VoiceAgent[]>> {
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
        if (filters.type) {
          query = query.eq('type', filters.type)
        }
        if (filters.name_search) {
          query = query.ilike('name', `%${filters.name_search}%`)
        }
        if (filters.description_search) {
          query = query.ilike('description', `%${filters.description_search}%`)
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
        console.error('Error fetching voice agents:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getVoiceAgents:', error)
      return { data: null, error: 'Failed to fetch voice agents', success: false }
    }
  }

  async getVoiceAgent(id: string): Promise<ServiceResponse<VoiceAgent>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching voice agent:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in getVoiceAgent:', error)
      return { data: null, error: 'Failed to fetch voice agent', success: false }
    }
  }

  async createVoiceAgent(agentData: VoiceAgentInsert): Promise<ServiceResponse<VoiceAgent>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(agentData)
        .select()
        .single()

      if (error) {
        console.error('Error creating voice agent:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in createVoiceAgent:', error)
      return { data: null, error: 'Failed to create voice agent', success: false }
    }
  }

  async updateVoiceAgent(id: string, updates: VoiceAgentUpdate): Promise<ServiceResponse<VoiceAgent>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating voice agent:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in updateVoiceAgent:', error)
      return { data: null, error: 'Failed to update voice agent', success: false }
    }
  }

  async deleteVoiceAgent(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting voice agent:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: true, error: null, success: true }
    } catch (error) {
      console.error('Error in deleteVoiceAgent:', error)
      return { data: null, error: 'Failed to delete voice agent', success: false }
    }
  }

  async getVoiceAgentStats(): Promise<ServiceResponse<VoiceAgentStats>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status')

      if (error) {
        console.error('Error fetching voice agent stats:', error)
        return { data: null, error: error.message, success: false }
      }

      const stats: VoiceAgentStats = {
        total: data.length,
        active: data.filter(a => a.status === 'active').length,
        inactive: data.filter(a => a.status === 'inactive').length,
        training: data.filter(a => a.status === 'training').length,
        error: data.filter(a => a.status === 'error').length,
        totalCalls: 0, // These would come from a separate calls table
        successfulCalls: 0,
        averageCallDuration: 0,
        conversionRate: 0
      }

      return { data: stats, error: null, success: true }
    } catch (error) {
      console.error('Error in getVoiceAgentStats:', error)
      return { data: null, error: 'Failed to fetch voice agent stats', success: false }
    }
  }

  async searchVoiceAgents(query: string): Promise<ServiceResponse<VoiceAgent[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error searching voice agents:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in searchVoiceAgents:', error)
      return { data: null, error: 'Failed to search voice agents', success: false }
    }
  }

  // Vapi API Integration
  async createVapiAgent(agentData: any): Promise<ServiceResponse<any>> {
    try {
      // This would integrate with Vapi API
      // For now, we'll simulate the API call
      const vapiAgent = {
        id: `vapi_${Date.now()}`,
        name: agentData.name,
        model: agentData.model || 'gpt-4',
        voice: agentData.voice || 'alloy',
        firstMessage: agentData.first_message || 'Hello! How can I help you today?',
        systemMessage: agentData.system_message || 'You are a helpful AI assistant.',
        maxDuration: agentData.max_duration || 300,
        webhookUrl: agentData.webhook_url,
        status: 'active'
      }

      return { data: vapiAgent, error: null, success: true }
    } catch (error) {
      console.error('Error creating Vapi agent:', error)
      return { data: null, error: 'Failed to create Vapi agent', success: false }
    }
  }

  async updateVapiAgent(agentId: string, updates: any): Promise<ServiceResponse<any>> {
    try {
      // This would integrate with Vapi API
      // For now, we'll simulate the API call
      const vapiAgent = {
        id: agentId,
        ...updates,
        updated_at: new Date().toISOString()
      }

      return { data: vapiAgent, error: null, success: true }
    } catch (error) {
      console.error('Error updating Vapi agent:', error)
      return { data: null, error: 'Failed to update Vapi agent', success: false }
    }
  }

  async deleteVapiAgent(_agentId: string): Promise<ServiceResponse<boolean>> {
    try {
      // This would integrate with Vapi API
      // For now, we'll simulate the API call
      return { data: true, error: null, success: true }
    } catch (error) {
      console.error('Error deleting Vapi agent:', error)
      return { data: null, error: 'Failed to delete Vapi agent', success: false }
    }
  }

  async makeCall(agentId: string, phoneNumber: string, clientId?: string): Promise<ServiceResponse<VoiceAgentCall>> {
    try {
      // This would integrate with Vapi API to make a call
      // For now, we'll simulate the API call
      const call: VoiceAgentCall = {
        id: `call_${Date.now()}`,
        agent_id: agentId,
        client_id: clientId,
        phone_number: phoneNumber,
        status: 'initiated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return { data: call, error: null, success: true }
    } catch (error) {
      console.error('Error making call:', error)
      return { data: null, error: 'Failed to make call', success: false }
    }
  }

  async getAgentCalls(agentId: string): Promise<ServiceResponse<VoiceAgentCall[]>> {
    try {
      // This would fetch calls from Vapi API
      // For now, we'll return mock data
      const mockCalls: VoiceAgentCall[] = [
        {
          id: 'call_1',
          agent_id: agentId,
          client_id: 'client_1',
          phone_number: '+1234567890',
          status: 'completed',
          duration: 120,
          transcript: 'Hello, this is a sample call transcript...',
          outcome: 'successful',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]

      return { data: mockCalls, error: null, success: true }
    } catch (error) {
      console.error('Error fetching agent calls:', error)
      return { data: null, error: 'Failed to fetch agent calls', success: false }
    }
  }

  // Real-time subscriptions
  subscribeToVoiceAgents(callback: (payload: any) => void) {
    return supabase
      .channel('voice_agents_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'voice_agents'
      }, callback)
      .subscribe()
  }

  subscribeToVoiceAgentStats(callback: (payload: any) => void) {
    return supabase
      .channel('voice_agent_stats_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'voice_agents'
      }, callback)
      .subscribe()
  }
}

export const VoiceAgentService = new VoiceAgentServiceClass()

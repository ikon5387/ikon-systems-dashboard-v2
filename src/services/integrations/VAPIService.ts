import { config } from '@/lib/env'
import { notifications } from '@/lib/notifications'

export interface VoiceAgent {
  id: string
  name: string
  phoneNumber: string
  status: 'active' | 'inactive'
  script: string
  performanceMetrics: {
    totalCalls: number
    answeredCalls: number
    missedCalls: number
    averageDuration: number
    customerSatisfaction: number
  }
}

export interface CreateVoiceAgentData {
  name: string
  phoneNumber: string
  script: string
  clientId?: string
}

export interface CallLog {
  id: string
  agentId: string
  phoneNumber: string
  duration: number
  status: 'completed' | 'missed' | 'failed'
  transcript?: string
  timestamp: string
}

export interface VAPIResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

class VAPIServiceClass {
  private readonly apiKey: string | undefined
  private readonly baseUrl = 'https://api.vapi.ai'
  private readonly enabled: boolean

  constructor() {
    this.apiKey = config.integrations.vapi.apiKey
    this.enabled = config.integrations.vapi.enabled
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<VAPIResponse<T>> {
    if (!this.enabled || !this.apiKey) {
      return {
        data: null,
        error: 'VAPI integration is not configured',
        success: false
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      notifications.error(`VAPI Error: ${errorMessage}`)
      return {
        data: null,
        error: errorMessage,
        success: false
      }
    }
  }

  async createVoiceAgent(agentData: CreateVoiceAgentData): Promise<VAPIResponse<VoiceAgent>> {
    const payload = {
      name: agentData.name,
      phoneNumberId: agentData.phoneNumber,
      initialMessage: agentData.script,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        systemMessage: `You are an AI receptionist for Ikon Systems, a home remodeling company. 
                       Be professional, helpful, and knowledgeable about home remodeling services.
                       Always try to schedule appointments or collect contact information.`
      },
      voice: {
        provider: 'elevenlabs',
        voiceId: 'default',
        stability: 0.5,
        similarityBoost: 0.75
      }
    }

    const response = await this.makeRequest<any>('/assistant', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (response.success && response.data) {
      const voiceAgent: VoiceAgent = {
        id: response.data.id,
        name: agentData.name,
        phoneNumber: agentData.phoneNumber,
        status: 'active',
        script: agentData.script,
        performanceMetrics: {
          totalCalls: 0,
          answeredCalls: 0,
          missedCalls: 0,
          averageDuration: 0,
          customerSatisfaction: 0
        }
      }

      notifications.success(`Voice agent "${agentData.name}" created successfully`)
      return {
        data: voiceAgent,
        error: null,
        success: true
      }
    }

    return response
  }

  async getVoiceAgents(): Promise<VAPIResponse<VoiceAgent[]>> {
    const response = await this.makeRequest<any[]>('/assistant')

    if (response.success && response.data) {
      const agents: VoiceAgent[] = response.data.map(agent => ({
        id: agent.id,
        name: agent.name || 'Unnamed Agent',
        phoneNumber: agent.phoneNumberId || '',
        status: agent.status || 'inactive',
        script: agent.initialMessage || '',
        performanceMetrics: {
          totalCalls: agent.callCount || 0,
          answeredCalls: agent.answeredCallCount || 0,
          missedCalls: (agent.callCount || 0) - (agent.answeredCallCount || 0),
          averageDuration: agent.averageCallDuration || 0,
          customerSatisfaction: agent.customerSatisfaction || 0
        }
      }))

      return {
        data: agents,
        error: null,
        success: true
      }
    }

    return response
  }

  async getVoiceAgent(agentId: string): Promise<VAPIResponse<VoiceAgent>> {
    const response = await this.makeRequest<any>(`/assistant/${agentId}`)

    if (response.success && response.data) {
      const agent = response.data
      const voiceAgent: VoiceAgent = {
        id: agent.id,
        name: agent.name || 'Unnamed Agent',
        phoneNumber: agent.phoneNumberId || '',
        status: agent.status || 'inactive',
        script: agent.initialMessage || '',
        performanceMetrics: {
          totalCalls: agent.callCount || 0,
          answeredCalls: agent.answeredCallCount || 0,
          missedCalls: (agent.callCount || 0) - (agent.answeredCallCount || 0),
          averageDuration: agent.averageCallDuration || 0,
          customerSatisfaction: agent.customerSatisfaction || 0
        }
      }

      return {
        data: voiceAgent,
        error: null,
        success: true
      }
    }

    return response
  }

  async updateVoiceAgent(
    agentId: string, 
    updates: Partial<CreateVoiceAgentData>
  ): Promise<VAPIResponse<VoiceAgent>> {
    const payload: any = {}

    if (updates.name) payload.name = updates.name
    if (updates.phoneNumber) payload.phoneNumberId = updates.phoneNumber
    if (updates.script) payload.initialMessage = updates.script

    const response = await this.makeRequest<any>(`/assistant/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })

    if (response.success) {
      notifications.success('Voice agent updated successfully')
      return this.getVoiceAgent(agentId)
    }

    return response
  }

  async deleteVoiceAgent(agentId: string): Promise<VAPIResponse<void>> {
    const response = await this.makeRequest<void>(`/assistant/${agentId}`, {
      method: 'DELETE'
    })

    if (response.success) {
      notifications.success('Voice agent deleted successfully')
    }

    return response
  }

  async getCallLogs(agentId: string): Promise<VAPIResponse<CallLog[]>> {
    const response = await this.makeRequest<any[]>(`/call?assistantId=${agentId}`)

    if (response.success && response.data) {
      const callLogs: CallLog[] = response.data.map(call => ({
        id: call.id,
        agentId: call.assistantId,
        phoneNumber: call.phoneNumber || '',
        duration: call.duration || 0,
        status: call.status || 'failed',
        transcript: call.transcript,
        timestamp: call.createdAt || new Date().toISOString()
      }))

      return {
        data: callLogs,
        error: null,
        success: true
      }
    }

    return response
  }

  async startCall(agentId: string, phoneNumber: string): Promise<VAPIResponse<{ callId: string }>> {
    const payload = {
      assistantId: agentId,
      phoneNumber: phoneNumber
    }

    const response = await this.makeRequest<any>('/call', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (response.success && response.data) {
      notifications.success('Call initiated successfully')
      return {
        data: { callId: response.data.id },
        error: null,
        success: true
      }
    }

    return response
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  get hasApiKey(): boolean {
    return !!this.apiKey
  }
}

export const VAPIService = new VAPIServiceClass()

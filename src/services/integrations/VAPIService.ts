import { config } from '@/lib/env'
import { notifications } from '@/lib/notifications'

export interface VoiceAgent {
  id: string
  name: string
  phoneNumber: string
  status: 'active' | 'inactive' | 'training' | 'error'
  script: string
  type: 'sales' | 'support' | 'appointment' | 'follow_up' | 'custom'
  model: string
  voice: string
  maxDuration: number
  language: string
  temperature: number
  maxTokens: number
  performanceMetrics: {
    totalCalls: number
    answeredCalls: number
    missedCalls: number
    averageDuration: number
    customerSatisfaction: number
    conversionRate: number
    successRate: number
  }
  vapiAgentId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateVoiceAgentData {
  name: string
  phoneNumber: string
  script: string
  type?: 'sales' | 'support' | 'appointment' | 'follow_up' | 'custom'
  model?: string
  voice?: string
  maxDuration?: number
  language?: string
  temperature?: number
  maxTokens?: number
  clientId?: string
  systemMessage?: string
  firstMessage?: string
}

export interface UpdateVoiceAgentData {
  name?: string
  script?: string
  status?: 'active' | 'inactive' | 'training' | 'error'
  model?: string
  voice?: string
  maxDuration?: number
  temperature?: number
  maxTokens?: number
  systemMessage?: string
  firstMessage?: string
}

export interface CallLog {
  id: string
  agentId: string
  phoneNumber: string
  duration: number
  status: 'completed' | 'missed' | 'failed' | 'busy' | 'no_answer'
  transcript?: string
  recordingUrl?: string
  outcome?: string
  customerSatisfaction?: number
  timestamp: string
  cost?: number
}

export interface CallAnalytics {
  totalCalls: number
  answeredCalls: number
  missedCalls: number
  averageDuration: number
  totalCost: number
  conversionRate: number
  successRate: number
  callsByDay: Array<{
    date: string
    calls: number
    answered: number
    missed: number
  }>
}

export interface VAPIResponse<T> {
  data: T | null
  error: string | null
  success: boolean
  message?: string
}

class VAPIServiceClass {
  private readonly apiKey: string | undefined
  private readonly baseUrl = 'https://api.vapi.ai'
  private readonly enabled: boolean
  private readonly webhookUrl: string

  constructor() {
    this.apiKey = config.integrations.vapi.apiKey
    this.enabled = config.integrations.vapi.enabled
    this.webhookUrl = `${window.location.origin}/api/webhooks/vapi`
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
    const systemMessage = agentData.systemMessage || this.getDefaultSystemMessage(agentData.type || 'sales')
    const firstMessage = agentData.firstMessage || agentData.script

    const payload = {
      name: agentData.name,
      phoneNumberId: agentData.phoneNumber,
      firstMessage: firstMessage,
      systemMessage: systemMessage,
      model: {
        provider: 'openai',
        model: agentData.model || 'gpt-4',
        temperature: agentData.temperature || 0.7,
        maxTokens: agentData.maxTokens || 1000
      },
      voice: {
        provider: 'openai',
        voiceId: agentData.voice || 'alloy'
      },
      maxDurationSeconds: agentData.maxDuration || 300,
      language: agentData.language || 'en',
      webhookUrl: this.webhookUrl,
      metadata: {
        type: agentData.type || 'sales',
        clientId: agentData.clientId
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
        type: agentData.type || 'sales',
        model: agentData.model || 'gpt-4',
        voice: agentData.voice || 'alloy',
        maxDuration: agentData.maxDuration || 300,
        language: agentData.language || 'en',
        temperature: agentData.temperature || 0.7,
        maxTokens: agentData.maxTokens || 1000,
        vapiAgentId: response.data.id,
        performanceMetrics: {
          totalCalls: 0,
          answeredCalls: 0,
          missedCalls: 0,
          averageDuration: 0,
          customerSatisfaction: 0,
          conversionRate: 0,
          successRate: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      notifications.success(`Voice agent "${agentData.name}" created successfully`)
      return {
        data: voiceAgent,
        error: null,
        success: true,
        message: 'Voice agent created successfully'
      }
    }

    return response
  }

  private getDefaultSystemMessage(type: string): string {
    const systemMessages = {
      sales: `You are a professional sales representative for Ikon Systems, a home remodeling company. Your goal is to:
- Qualify leads and understand their remodeling needs
- Schedule appointments for in-home consultations
- Provide information about our services
- Be friendly, professional, and helpful
- Always ask for their contact information and preferred appointment times
- If they're interested, offer to schedule a free consultation`,
      
      support: `You are a customer support representative for Ikon Systems. Your goal is to:
- Help existing customers with questions about their projects
- Provide updates on project status
- Address concerns and resolve issues
- Be empathetic and solution-oriented
- Escalate complex issues to human agents when needed`,
      
      appointment: `You are an appointment scheduler for Ikon Systems. Your goal is to:
- Confirm existing appointments
- Reschedule appointments when needed
- Provide appointment details and reminders
- Be clear about time, date, and location
- Confirm contact information`,
      
      follow_up: `You are a follow-up specialist for Ikon Systems. Your goal is to:
- Follow up with leads who haven't responded
- Check on project satisfaction
- Gather feedback and testimonials
- Be persistent but not pushy
- Respect their time and preferences`,
      
      custom: `You are a voice agent for Ikon Systems. Be professional, helpful, and follow the provided script.`
    }

    return systemMessages[type as keyof typeof systemMessages] || systemMessages.custom
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

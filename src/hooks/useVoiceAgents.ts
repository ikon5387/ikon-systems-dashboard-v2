import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { VoiceAgentService, type VoiceAgentInsert, type VoiceAgentUpdate, type VoiceAgentFilters } from '@/services/voice-agents/VoiceAgentService'
import { notifications } from '@/lib/notifications'

// Query Keys
export const voiceAgentKeys = {
  all: ['voiceAgents'] as const,
  lists: () => [...voiceAgentKeys.all, 'list'] as const,
  list: (filters?: VoiceAgentFilters) => [...voiceAgentKeys.lists(), { filters }] as const,
  details: () => [...voiceAgentKeys.all, 'detail'] as const,
  detail: (id: string) => [...voiceAgentKeys.details(), id] as const,
  stats: () => [...voiceAgentKeys.all, 'stats'] as const,
  calls: (agentId: string) => [...voiceAgentKeys.all, 'calls', agentId] as const,
  search: (query: string) => [...voiceAgentKeys.all, 'search', query] as const,
}

// Hooks
export function useVoiceAgents(filters?: VoiceAgentFilters) {
  return useQuery({
    queryKey: voiceAgentKeys.list(filters),
    queryFn: () => VoiceAgentService.getVoiceAgents(filters),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useVoiceAgent(id: string) {
  return useQuery({
    queryKey: voiceAgentKeys.detail(id),
    queryFn: () => VoiceAgentService.getVoiceAgent(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useVoiceAgentStats() {
  return useQuery({
    queryKey: voiceAgentKeys.stats(),
    queryFn: () => VoiceAgentService.getVoiceAgentStats(),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useVoiceAgentCalls(agentId: string) {
  return useQuery({
    queryKey: voiceAgentKeys.calls(agentId),
    queryFn: () => VoiceAgentService.getAgentCalls(agentId),
    select: (response) => response.data || [],
    enabled: !!agentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useSearchVoiceAgents(query: string) {
  return useQuery({
    queryKey: voiceAgentKeys.search(query),
    queryFn: () => VoiceAgentService.searchVoiceAgents(query),
    select: (response) => response.data || [],
    enabled: query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutations
export function useCreateVoiceAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: VoiceAgentInsert) => VoiceAgentService.createVoiceAgent(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate and refetch voice agent lists
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.stats() })
        
        notifications.success('Voice agent created successfully!')
      } else {
        notifications.error(response.error || 'Failed to create voice agent')
      }
    },
    onError: (error) => {
      console.error('Error creating voice agent:', error)
      notifications.error('Failed to create voice agent')
    },
  })
}

export function useUpdateVoiceAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & VoiceAgentUpdate) => 
      VoiceAgentService.updateVoiceAgent(id, data),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update the specific voice agent in cache
        queryClient.setQueryData(
          voiceAgentKeys.detail(variables.id),
          response.data
        )
        
        // Invalidate lists to refetch
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.stats() })
        
        notifications.success('Voice agent updated successfully!')
      } else {
        notifications.error(response.error || 'Failed to update voice agent')
      }
    },
    onError: (error) => {
      console.error('Error updating voice agent:', error)
      notifications.error('Failed to update voice agent')
    },
  })
}

export function useDeleteVoiceAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => VoiceAgentService.deleteVoiceAgent(id),
    onSuccess: (response, id) => {
      if (response.data) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: voiceAgentKeys.detail(id) })
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.stats() })
        
        notifications.success('Voice agent deleted successfully!')
      } else {
        notifications.error(response.error || 'Failed to delete voice agent')
      }
    },
    onError: (error) => {
      console.error('Error deleting voice agent:', error)
      notifications.error('Failed to delete voice agent')
    },
  })
}

export function useUpdateVoiceAgentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' | 'training' | 'error' }) =>
      VoiceAgentService.updateVoiceAgent(id, { status }),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update cache
        queryClient.setQueryData(
          voiceAgentKeys.detail(variables.id),
          response.data
        )
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.stats() })
        
        notifications.success('Voice agent status updated!')
      } else {
        notifications.error(response.error || 'Failed to update voice agent status')
      }
    },
    onError: (error) => {
      console.error('Error updating voice agent status:', error)
      notifications.error('Failed to update voice agent status')
    },
  })
}

// Vapi API Mutations
export function useCreateVapiAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => VoiceAgentService.createVapiAgent(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate voice agent lists to refetch
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.stats() })
        
        notifications.success('Vapi agent created successfully!')
      } else {
        notifications.error(response.error || 'Failed to create Vapi agent')
      }
    },
    onError: (error) => {
      console.error('Error creating Vapi agent:', error)
      notifications.error('Failed to create Vapi agent')
    },
  })
}

export function useUpdateVapiAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ agentId, ...data }: { agentId: string } & any) => 
      VoiceAgentService.updateVapiAgent(agentId, data),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.detail(variables.agentId) })
        
        notifications.success('Vapi agent updated successfully!')
      } else {
        notifications.error(response.error || 'Failed to update Vapi agent')
      }
    },
    onError: (error) => {
      console.error('Error updating Vapi agent:', error)
      notifications.error('Failed to update Vapi agent')
    },
  })
}

export function useDeleteVapiAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (agentId: string) => VoiceAgentService.deleteVapiAgent(agentId),
    onSuccess: (response, agentId) => {
      if (response.data) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: voiceAgentKeys.detail(agentId) })
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.stats() })
        
        notifications.success('Vapi agent deleted successfully!')
      } else {
        notifications.error(response.error || 'Failed to delete Vapi agent')
      }
    },
    onError: (error) => {
      console.error('Error deleting Vapi agent:', error)
      notifications.error('Failed to delete Vapi agent')
    },
  })
}

export function useMakeCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ agentId, phoneNumber, clientId }: { agentId: string; phoneNumber: string; clientId?: string }) =>
      VoiceAgentService.makeCall(agentId, phoneNumber, clientId),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Invalidate agent calls
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.calls(variables.agentId) })
        
        notifications.success('Call initiated successfully!')
      } else {
        notifications.error(response.error || 'Failed to initiate call')
      }
    },
    onError: (error) => {
      console.error('Error making call:', error)
      notifications.error('Failed to initiate call')
    },
  })
}

// Real-time hooks
export function useVoiceAgentRealtime() {
  const queryClient = useQueryClient()

  return {
    subscribeToVoiceAgents: () => {
      return VoiceAgentService.subscribeToVoiceAgents((payload) => {
        console.log('Voice agent real-time update:', payload)
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.stats() })
        
        // Update specific voice agent if it's in cache
        if (payload.new && payload.new.id) {
          queryClient.setQueryData(
            voiceAgentKeys.detail(payload.new.id),
            payload.new
          )
        }
      })
    },
    
    subscribeToStats: () => {
      return VoiceAgentService.subscribeToVoiceAgentStats((payload) => {
        console.log('Voice agent stats real-time update:', payload)
        queryClient.invalidateQueries({ queryKey: voiceAgentKeys.stats() })
      })
    }
  }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientService, type ClientInsert, type ClientUpdate, type ClientFilters } from '@/services/clients/ClientService'
import { notifications } from '@/lib/notifications'

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters?: ClientFilters) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  stats: () => [...clientKeys.all, 'stats'] as const,
  recent: (limit: number) => [...clientKeys.all, 'recent', limit] as const,
  byStatus: (status: string) => [...clientKeys.all, 'byStatus', status] as const,
  search: (query: string) => [...clientKeys.all, 'search', query] as const,
}

// Hooks
export function useClients(filters?: ClientFilters) {
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: () => ClientService.getClients(filters),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => ClientService.getClient(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useClientStats() {
  return useQuery({
    queryKey: clientKeys.stats(),
    queryFn: () => ClientService.getClientStats(),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useRecentClients(limit: number = 5) {
  return useQuery({
    queryKey: clientKeys.recent(limit),
    queryFn: () => ClientService.getRecentClients(limit),
    select: (response) => response.data || [],
    staleTime: 2 * 60 * 1000,
  })
}

export function useClientsByStatus(status: 'lead' | 'prospect' | 'active' | 'churned') {
  return useQuery({
    queryKey: clientKeys.byStatus(status),
    queryFn: () => ClientService.getClientsByStatus(status),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000,
  })
}

export function useSearchClients(query: string) {
  return useQuery({
    queryKey: clientKeys.search(query),
    queryFn: () => ClientService.searchClients(query),
    select: (response) => response.data || [],
    enabled: query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutations
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ClientInsert) => ClientService.createClient(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate and refetch client lists
        queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
        queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
        queryClient.invalidateQueries({ queryKey: clientKeys.recent(5) })
        
        notifications.success('Client created successfully!')
      } else {
        notifications.error(response.error || 'Failed to create client')
      }
    },
    onError: (error) => {
      console.error('Error creating client:', error)
      notifications.error('Failed to create client')
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & ClientUpdate) => 
      ClientService.updateClient(id, data),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update the specific client in cache
        queryClient.setQueryData(
          clientKeys.detail(variables.id),
          response.data
        )
        
        // Invalidate lists to refetch
        queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
        queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
        queryClient.invalidateQueries({ queryKey: clientKeys.recent(5) })
        
        notifications.success('Client updated successfully!')
      } else {
        notifications.error(response.error || 'Failed to update client')
      }
    },
    onError: (error) => {
      console.error('Error updating client:', error)
      notifications.error('Failed to update client')
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ClientService.deleteClient(id),
    onSuccess: (response, id) => {
      if (response.data) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: clientKeys.detail(id) })
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
        queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
        queryClient.invalidateQueries({ queryKey: clientKeys.recent(5) })
        
        notifications.success('Client deleted successfully!')
      } else {
        notifications.error(response.error || 'Failed to delete client')
      }
    },
    onError: (error) => {
      console.error('Error deleting client:', error)
      notifications.error('Failed to delete client')
    },
  })
}

export function useUpdateClientStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'lead' | 'prospect' | 'active' | 'churned' }) =>
      ClientService.updateClient(id, { status }),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update cache
        queryClient.setQueryData(
          clientKeys.detail(variables.id),
          response.data
        )
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
        queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
        queryClient.invalidateQueries({ queryKey: clientKeys.byStatus(variables.status) })
        
        notifications.success('Client status updated!')
      } else {
        notifications.error(response.error || 'Failed to update client status')
      }
    },
    onError: (error) => {
      console.error('Error updating client status:', error)
      notifications.error('Failed to update client status')
    },
  })
}

// Real-time hooks
export function useClientRealtime() {
  const queryClient = useQueryClient()

  return {
    subscribeToClients: () => {
      return ClientService.subscribeToClients((payload) => {
        console.log('Client real-time update:', payload)
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
        queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
        queryClient.invalidateQueries({ queryKey: clientKeys.recent(5) })
        
        // Update specific client if it's in cache
        if (payload.new && payload.new.id) {
          queryClient.setQueryData(
            clientKeys.detail(payload.new.id),
            payload.new
          )
        }
      })
    },
    
    subscribeToStats: () => {
      return ClientService.subscribeToClientStats((payload) => {
        console.log('Client stats real-time update:', payload)
        queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
      })
    }
  }
}
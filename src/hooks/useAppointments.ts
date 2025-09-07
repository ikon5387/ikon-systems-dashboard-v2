import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppointmentService, type AppointmentInsert, type AppointmentUpdate, type AppointmentFilters } from '@/services/appointments/AppointmentService'
import { notifications } from '@/lib/notifications'

// Query Keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters?: AppointmentFilters) => [...appointmentKeys.lists(), { filters }] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  stats: () => [...appointmentKeys.all, 'stats'] as const,
  today: () => [...appointmentKeys.all, 'today'] as const,
  upcoming: (limit: number) => [...appointmentKeys.all, 'upcoming', limit] as const,
  search: (query: string) => [...appointmentKeys.all, 'search', query] as const,
}

// Hooks
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => AppointmentService.getAppointments(filters),
    select: (response) => response.data || [],
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => AppointmentService.getAppointment(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAppointmentStats() {
  return useQuery({
    queryKey: appointmentKeys.stats(),
    queryFn: () => AppointmentService.getAppointmentStats(),
    select: (response) => response.data,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useTodaysAppointments() {
  return useQuery({
    queryKey: appointmentKeys.today(),
    queryFn: () => AppointmentService.getTodaysAppointments(),
    select: (response) => response.data || [],
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}

export function useUpcomingAppointments(limit: number = 5) {
  return useQuery({
    queryKey: appointmentKeys.upcoming(limit),
    queryFn: () => AppointmentService.getUpcomingAppointments(limit),
    select: (response) => response.data || [],
    staleTime: 2 * 60 * 1000,
  })
}

export function useSearchAppointments(query: string) {
  return useQuery({
    queryKey: appointmentKeys.search(query),
    queryFn: () => AppointmentService.searchAppointments(query),
    select: (response) => response.data || [],
    enabled: query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutations
export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AppointmentInsert) => AppointmentService.createAppointment(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate and refetch appointment lists
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.today() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming(5) })
        
        notifications.success('Appointment created successfully!')
      } else {
        notifications.error(response.error || 'Failed to create appointment')
      }
    },
    onError: (error) => {
      console.error('Error creating appointment:', error)
      notifications.error('Failed to create appointment')
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & AppointmentUpdate) => 
      AppointmentService.updateAppointment(id, data),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update the specific appointment in cache
        queryClient.setQueryData(
          appointmentKeys.detail(variables.id),
          response.data
        )
        
        // Invalidate lists to refetch
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.today() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming(5) })
        
        notifications.success('Appointment updated successfully!')
      } else {
        notifications.error(response.error || 'Failed to update appointment')
      }
    },
    onError: (error) => {
      console.error('Error updating appointment:', error)
      notifications.error('Failed to update appointment')
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AppointmentService.deleteAppointment(id),
    onSuccess: (response, id) => {
      if (response.data) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: appointmentKeys.detail(id) })
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.today() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming(5) })
        
        notifications.success('Appointment deleted successfully!')
      } else {
        notifications.error(response.error || 'Failed to delete appointment')
      }
    },
    onError: (error) => {
      console.error('Error deleting appointment:', error)
      notifications.error('Failed to delete appointment')
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' }) =>
      AppointmentService.updateAppointment(id, { status: status === 'rescheduled' ? 'scheduled' : status }),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update cache
        queryClient.setQueryData(
          appointmentKeys.detail(variables.id),
          response.data
        )
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.today() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming(5) })
        
        notifications.success('Appointment status updated!')
      } else {
        notifications.error(response.error || 'Failed to update appointment status')
      }
    },
    onError: (error) => {
      console.error('Error updating appointment status:', error)
      notifications.error('Failed to update appointment status')
    },
  })
}

export function useSyncWithGoogleCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appointmentId: string) => AppointmentService.syncWithGoogleCalendar(appointmentId),
    onSuccess: (response, appointmentId) => {
      if (response.data) {
        // Invalidate the specific appointment to refetch with Google Calendar ID
        queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(appointmentId) })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
        
        notifications.success('Appointment synced with Google Calendar!')
      } else {
        notifications.error(response.error || 'Failed to sync with Google Calendar')
      }
    },
    onError: (error) => {
      console.error('Error syncing with Google Calendar:', error)
      notifications.error('Failed to sync with Google Calendar')
    },
  })
}

// Real-time hooks
export function useAppointmentRealtime() {
  const queryClient = useQueryClient()

  return {
    subscribeToAppointments: () => {
      return AppointmentService.subscribeToAppointments((payload) => {
        console.log('Appointment real-time update:', payload)
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.today() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming(5) })
        
        // Update specific appointment if it's in cache
        if (payload.new && payload.new.id) {
          queryClient.setQueryData(
            appointmentKeys.detail(payload.new.id),
            payload.new
          )
        }
      })
    },
    
    subscribeToStats: () => {
      return AppointmentService.subscribeToAppointmentStats((payload) => {
        console.log('Appointment stats real-time update:', payload)
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() })
      })
    }
  }
}

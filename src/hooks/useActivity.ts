import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ActivityService, ActivityInsert } from '@/services/activity/ActivityService'
import { useAuth } from './useAuth'

export function useRecentActivities(limit: number = 10) {
  return useQuery({
    queryKey: ['activities', 'recent', limit],
    queryFn: () => ActivityService.getRecentActivities(limit),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 0, // Always consider data stale to get fresh updates
  })
}

export function useUserActivities(userId: string, limit: number = 20) {
  return useQuery({
    queryKey: ['activities', 'user', userId, limit],
    queryFn: () => ActivityService.getUserActivities(userId, limit),
    enabled: !!userId,
    refetchInterval: 5000,
    staleTime: 0,
  })
}

export function useLogActivity() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (activityData: ActivityInsert) => ActivityService.logActivity(activityData),
    onSuccess: () => {
      // Invalidate and refetch activities
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

export function useActivityRealtime() {
  const queryClient = useQueryClient()
  
  return {
    subscribe: (callback: (payload: any) => void) => {
      const subscription = ActivityService.subscribeToActivities((payload) => {
        // Update the cache with new activity
        queryClient.setQueryData(['activities', 'recent', 10], (oldData: any) => {
          if (!oldData?.data) return oldData
          
          const newActivity = payload.new
          if (payload.eventType === 'INSERT' && newActivity) {
            return {
              ...oldData,
              data: [newActivity, ...oldData.data.slice(0, 9)] // Keep only 10 most recent
            }
          }
          return oldData
        })
        
        callback(payload)
      })
      
      return subscription
    }
  }
}

// Helper hook for logging common activities
export function useActivityLogger() {
  const { user } = useAuth()
  const logActivity = useLogActivity()
  
  const logClientActivity = (action: 'created' | 'updated' | 'deleted', clientId: string, clientName: string) => {
    if (!user?.id) return
    
    const activityData: ActivityInsert = {
      user_id: user.id,
      action,
      entity_type: 'client',
      entity_id: clientId,
      entity_name: clientName,
      details: { action: `Client ${action}` }
    }
    
    logActivity.mutate(activityData)
  }
  
  const logProjectActivity = (action: 'created' | 'updated' | 'deleted', projectId: string, projectName: string) => {
    if (!user?.id) return
    
    const activityData: ActivityInsert = {
      user_id: user.id,
      action,
      entity_type: 'project',
      entity_id: projectId,
      entity_name: projectName,
      details: { action: `Project ${action}` }
    }
    
    logActivity.mutate(activityData)
  }
  
  const logAppointmentActivity = (action: 'created' | 'updated' | 'deleted', appointmentId: string, appointmentTitle: string) => {
    if (!user?.id) return
    
    const activityData: ActivityInsert = {
      user_id: user.id,
      action,
      entity_type: 'appointment',
      entity_id: appointmentId,
      entity_name: appointmentTitle,
      details: { action: `Appointment ${action}` }
    }
    
    logActivity.mutate(activityData)
  }
  
  const logInvoiceActivity = (action: 'created' | 'updated' | 'deleted', invoiceId: string, invoiceTitle: string) => {
    if (!user?.id) return
    
    const activityData: ActivityInsert = {
      user_id: user.id,
      action,
      entity_type: 'invoice',
      entity_id: invoiceId,
      entity_name: invoiceTitle,
      details: { action: `Invoice ${action}` }
    }
    
    logActivity.mutate(activityData)
  }
  
  return {
    logClientActivity,
    logProjectActivity,
    logAppointmentActivity,
    logInvoiceActivity,
    isLoading: logActivity.isPending
  }
}

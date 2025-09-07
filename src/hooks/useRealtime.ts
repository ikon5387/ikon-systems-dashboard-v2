import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UseRealtimeOptions {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  onAnyChange?: (payload: any) => void
  enabled?: boolean
}

export function useRealtime({
  table,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onAnyChange,
  enabled = true
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes' as any, {
        event,
        schema: 'public',
        table
      }, (payload: any) => {
        console.log(`Real-time update for ${table}:`, payload)
        
        // Call specific handlers
        if (payload.eventType === 'INSERT' && onInsert) {
          onInsert(payload)
        } else if (payload.eventType === 'UPDATE' && onUpdate) {
          onUpdate(payload)
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload)
        }
        
        // Call general handler
        if (onAnyChange) {
          onAnyChange(payload)
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, event, onInsert, onUpdate, onDelete, onAnyChange, enabled])

  return {
    channel: channelRef.current
  }
}

// Hook for real-time client updates
export function useRealtimeClients(callback: (payload: any) => void, enabled = true) {
  return useRealtime({
    table: 'clients',
    onAnyChange: callback,
    enabled
  })
}

// Hook for real-time project updates
export function useRealtimeProjects(callback: (payload: any) => void, enabled = true) {
  return useRealtime({
    table: 'projects',
    onAnyChange: callback,
    enabled
  })
}

// Hook for real-time appointment updates
export function useRealtimeAppointments(callback: (payload: any) => void, enabled = true) {
  return useRealtime({
    table: 'appointments',
    onAnyChange: callback,
    enabled
  })
}

// Hook for real-time voice agent updates
export function useRealtimeVoiceAgents(callback: (payload: any) => void, enabled = true) {
  return useRealtime({
    table: 'voice_agents',
    onAnyChange: callback,
    enabled
  })
}

// Hook for real-time financial updates
export function useRealtimeFinancials(callback: (payload: any) => void, enabled = true) {
  return useRealtime({
    table: 'financials',
    onAnyChange: callback,
    enabled
  })
}

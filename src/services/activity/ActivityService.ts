import { supabase } from '@/lib/supabase'
import { BaseService, ServiceResponse } from '../base/BaseService'

export interface Activity {
  id: string
  user_id: string
  action: string
  entity_type: 'client' | 'project' | 'appointment' | 'voice_agent' | 'invoice' | 'payment' | 'expense'
  entity_id: string
  entity_name: string
  details: any
  created_at: string
}

export interface ActivityInsert {
  user_id: string
  action: string
  entity_type: 'client' | 'project' | 'appointment' | 'voice_agent' | 'invoice' | 'payment' | 'expense'
  entity_id: string
  entity_name: string
  details?: any
}

class ActivityServiceClass extends BaseService {
  protected tableName = 'activities'

  async logActivity(activityData: ActivityInsert): Promise<ServiceResponse<Activity>> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert(activityData)
        .select()
        .single()

      if (error) {
        console.error('Error logging activity:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error logging activity:', error)
      return { data: null, error: 'Failed to log activity', success: false }
    }
  }

  async getRecentActivities(limit: number = 10): Promise<ServiceResponse<Activity[]>> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching activities:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error fetching activities:', error)
      return { data: null, error: 'Failed to fetch activities', success: false }
    }
  }

  async getUserActivities(userId: string, limit: number = 20): Promise<ServiceResponse<Activity[]>> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching user activities:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error fetching user activities:', error)
      return { data: null, error: 'Failed to fetch user activities', success: false }
    }
  }

  subscribeToActivities(callback: (payload: any) => void) {
    return supabase
      .channel('activities_changes')
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'activities'
      }, callback)
      .subscribe()
  }

  // Helper methods for common activities
  async logClientCreated(clientId: string, clientName: string, userId: string) {
    return this.logActivity({
      user_id: userId,
      action: 'created',
      entity_type: 'client',
      entity_id: clientId,
      entity_name: clientName,
      details: { action: 'Client created' }
    })
  }

  async logClientUpdated(clientId: string, clientName: string, userId: string) {
    return this.logActivity({
      user_id: userId,
      action: 'updated',
      entity_type: 'client',
      entity_id: clientId,
      entity_name: clientName,
      details: { action: 'Client updated' }
    })
  }

  async logClientDeleted(clientId: string, clientName: string, userId: string) {
    return this.logActivity({
      user_id: userId,
      action: 'deleted',
      entity_type: 'client',
      entity_id: clientId,
      entity_name: clientName,
      details: { action: 'Client deleted' }
    })
  }

  async logProjectCreated(projectId: string, projectName: string, userId: string) {
    return this.logActivity({
      user_id: userId,
      action: 'created',
      entity_type: 'project',
      entity_id: projectId,
      entity_name: projectName,
      details: { action: 'Project created' }
    })
  }

  async logProjectUpdated(projectId: string, projectName: string, userId: string) {
    return this.logActivity({
      user_id: userId,
      action: 'updated',
      entity_type: 'project',
      entity_id: projectId,
      entity_name: projectName,
      details: { action: 'Project updated' }
    })
  }

  async logAppointmentCreated(appointmentId: string, appointmentTitle: string, userId: string) {
    return this.logActivity({
      user_id: userId,
      action: 'created',
      entity_type: 'appointment',
      entity_id: appointmentId,
      entity_name: appointmentTitle,
      details: { action: 'Appointment created' }
    })
  }

  async logInvoiceCreated(invoiceId: string, invoiceTitle: string, userId: string) {
    return this.logActivity({
      user_id: userId,
      action: 'created',
      entity_type: 'invoice',
      entity_id: invoiceId,
      entity_name: invoiceTitle,
      details: { action: 'Invoice created' }
    })
  }
}

export const ActivityService = new ActivityServiceClass()

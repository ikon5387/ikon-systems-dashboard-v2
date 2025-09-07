import { BaseService, ServiceResponse, FilterParams, PaginationParams } from '../base/BaseService'
import { supabase } from '@/lib/supabase'
import type { Tables, InsertDto, UpdateDto } from '@/lib/supabase'

export type Project = Tables<'projects'>
export type ProjectInsert = InsertDto<'projects'>
export type ProjectUpdate = UpdateDto<'projects'>

export interface ProjectFilters extends FilterParams {
  status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  client_id?: string
  name_search?: string
  description_search?: string
}

export interface ProjectStats {
  total: number
  planning: number
  in_progress: number
  on_hold: number
  completed: number
  cancelled: number
  highPriority: number
  overdue: number
  recentlyCreated: number
  totalRevenue: number
}

export interface ProjectWithClient extends Project {
  client: {
    id: string
    name: string
    email: string
  }
}

class ProjectServiceClass extends BaseService {
  protected tableName = 'projects'

  async getProjects(filters?: ProjectFilters, pagination?: PaginationParams): Promise<ServiceResponse<ProjectWithClient[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.priority) {
          query = query.eq('priority', filters.priority)
        }
        if (filters.client_id) {
          query = query.eq('client_id', filters.client_id)
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
        console.error('Error fetching projects:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getProjects:', error)
      return { data: null, error: 'Failed to fetch projects', success: false }
    }
  }

  async getProject(id: string): Promise<ServiceResponse<ProjectWithClient>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in getProject:', error)
      return { data: null, error: 'Failed to fetch project', success: false }
    }
  }

  async createProject(projectData: ProjectInsert): Promise<ServiceResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(projectData)
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in createProject:', error)
      return { data: null, error: 'Failed to create project', success: false }
    }
  }

  async updateProject(id: string, updates: ProjectUpdate): Promise<ServiceResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating project:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in updateProject:', error)
      return { data: null, error: 'Failed to update project', success: false }
    }
  }

  async deleteProject(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting project:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: true, error: null, success: true }
    } catch (error) {
      console.error('Error in deleteProject:', error)
      return { data: null, error: 'Failed to delete project', success: false }
    }
  }

  async getProjectStats(): Promise<ServiceResponse<ProjectStats>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, priority, created_at, due_date, budget')

      if (error) {
        console.error('Error fetching project stats:', error)
        return { data: null, error: error.message, success: false }
      }

      const now = new Date()
      const stats: ProjectStats = {
        total: data.length,
        planning: data.filter(p => p.status === 'planning').length,
        in_progress: data.filter(p => p.status === 'in_progress').length,
        on_hold: data.filter(p => p.status === 'on_hold').length,
        completed: data.filter(p => p.status === 'completed').length,
        cancelled: data.filter(p => p.status === 'cancelled').length,
        highPriority: data.filter(p => p.priority === 'high' || p.priority === 'urgent').length,
        overdue: data.filter(p => {
          if (!p.due_date) return false
          return new Date(p.due_date) < now && p.status !== 'completed'
        }).length,
        recentlyCreated: data.filter(p => {
          const createdDate = new Date(p.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return createdDate > weekAgo
        }).length,
        totalRevenue: data
          .filter(p => p.status === 'completed' && p.budget)
          .reduce((sum, p) => sum + (p.budget || 0), 0)
      }

      return { data: stats, error: null, success: true }
    } catch (error) {
      console.error('Error in getProjectStats:', error)
      return { data: null, error: 'Failed to fetch project stats', success: false }
    }
  }

  async searchProjects(query: string): Promise<ServiceResponse<ProjectWithClient[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error searching projects:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in searchProjects:', error)
      return { data: null, error: 'Failed to search projects', success: false }
    }
  }

  async getRecentProjects(limit: number = 5): Promise<ServiceResponse<ProjectWithClient[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent projects:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getRecentProjects:', error)
      return { data: null, error: 'Failed to fetch recent projects', success: false }
    }
  }

  async getProjectsByStatus(status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'): Promise<ServiceResponse<ProjectWithClient[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(id, name, email)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects by status:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getProjectsByStatus:', error)
      return { data: null, error: 'Failed to fetch projects by status', success: false }
    }
  }

  async getProjectsByClient(clientId: string): Promise<ServiceResponse<Project[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching projects by client:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getProjectsByClient:', error)
      return { data: null, error: 'Failed to fetch projects by client', success: false }
    }
  }

  // Real-time subscriptions
  subscribeToProjects(callback: (payload: any) => void) {
    return supabase
      .channel('projects_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, callback)
      .subscribe()
  }

  subscribeToProjectStats(callback: (payload: any) => void) {
    return supabase
      .channel('project_stats_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, callback)
      .subscribe()
  }
}

export const ProjectService = new ProjectServiceClass()

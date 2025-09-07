import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProjectService, type ProjectInsert, type ProjectUpdate, type ProjectFilters } from '@/services/projects/ProjectService'
import { notifications } from '@/lib/notifications'

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilters) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: () => [...projectKeys.all, 'stats'] as const,
  recent: (limit: number) => [...projectKeys.all, 'recent', limit] as const,
  byStatus: (status: string) => [...projectKeys.all, 'byStatus', status] as const,
  byClient: (clientId: string) => [...projectKeys.all, 'byClient', clientId] as const,
  search: (query: string) => [...projectKeys.all, 'search', query] as const,
}

// Hooks
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => ProjectService.getProjects(filters),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => ProjectService.getProject(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useProjectStats() {
  return useQuery({
    queryKey: projectKeys.stats(),
    queryFn: () => ProjectService.getProjectStats(),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useRecentProjects(limit: number = 5) {
  return useQuery({
    queryKey: projectKeys.recent(limit),
    queryFn: () => ProjectService.getRecentProjects(limit),
    select: (response) => response.data || [],
    staleTime: 2 * 60 * 1000,
  })
}

export function useProjectsByStatus(status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled') {
  return useQuery({
    queryKey: projectKeys.byStatus(status),
    queryFn: () => ProjectService.getProjectsByStatus(status),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000,
  })
}

export function useProjectsByClient(clientId: string) {
  return useQuery({
    queryKey: projectKeys.byClient(clientId),
    queryFn: () => ProjectService.getProjectsByClient(clientId),
    select: (response) => response.data || [],
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSearchProjects(query: string) {
  return useQuery({
    queryKey: projectKeys.search(query),
    queryFn: () => ProjectService.searchProjects(query),
    select: (response) => response.data || [],
    enabled: query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutations
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectInsert) => ProjectService.createProject(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate and refetch project lists
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
        queryClient.invalidateQueries({ queryKey: projectKeys.recent(5) })
        
        notifications.success('Project created successfully!')
      } else {
        notifications.error(response.error || 'Failed to create project')
      }
    },
    onError: (error) => {
      console.error('Error creating project:', error)
      notifications.error('Failed to create project')
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & ProjectUpdate) => 
      ProjectService.updateProject(id, data),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update the specific project in cache
        queryClient.setQueryData(
          projectKeys.detail(variables.id),
          response.data
        )
        
        // Invalidate lists to refetch
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
        queryClient.invalidateQueries({ queryKey: projectKeys.recent(5) })
        
        notifications.success('Project updated successfully!')
      } else {
        notifications.error(response.error || 'Failed to update project')
      }
    },
    onError: (error) => {
      console.error('Error updating project:', error)
      notifications.error('Failed to update project')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ProjectService.deleteProject(id),
    onSuccess: (response, id) => {
      if (response.data) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: projectKeys.detail(id) })
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
        queryClient.invalidateQueries({ queryKey: projectKeys.recent(5) })
        
        notifications.success('Project deleted successfully!')
      } else {
        notifications.error(response.error || 'Failed to delete project')
      }
    },
    onError: (error) => {
      console.error('Error deleting project:', error)
      notifications.error('Failed to delete project')
    },
  })
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' }) =>
      ProjectService.updateProject(id, { status }),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update cache
        queryClient.setQueryData(
          projectKeys.detail(variables.id),
          response.data
        )
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
        queryClient.invalidateQueries({ queryKey: projectKeys.byStatus(variables.status) })
        
        notifications.success('Project status updated!')
      } else {
        notifications.error(response.error || 'Failed to update project status')
      }
    },
    onError: (error) => {
      console.error('Error updating project status:', error)
      notifications.error('Failed to update project status')
    },
  })
}

// Real-time hooks
export function useProjectRealtime() {
  const queryClient = useQueryClient()

  return {
    subscribeToProjects: () => {
      return ProjectService.subscribeToProjects((payload) => {
        console.log('Project real-time update:', payload)
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
        queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
        queryClient.invalidateQueries({ queryKey: projectKeys.recent(5) })
        
        // Update specific project if it's in cache
        if (payload.new && payload.new.id) {
          queryClient.setQueryData(
            projectKeys.detail(payload.new.id),
            payload.new
          )
        }
      })
    },
    
    subscribeToStats: () => {
      return ProjectService.subscribeToProjectStats((payload) => {
        console.log('Project stats real-time update:', payload)
        queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
      })
    }
  }
}

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiFlag,
  FiMoreVertical,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPause,
  FiXCircle
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { ProjectWithClient } from '@/services/projects/ProjectService'

const statusConfig = {
  planning: {
    label: 'Planning',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    icon: FiClock
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    icon: FiAlertCircle
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    icon: FiPause
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    icon: FiCheckCircle
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: FiXCircle
  }
}

const priorityConfig = {
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  }
}

export function ProjectsPage() {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectWithClient | null>(null)
  const [deletingProject, setDeletingProject] = useState<ProjectWithClient | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: projects, isLoading, error } = useProjects()
  const createProjectMutation = useCreateProject()
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    if (!projects) return []

    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client?.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || (project as any).priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [projects, searchQuery, statusFilter, priorityFilter])

  const handleCreateProject = async (data: any) => {
    try {
      await createProjectMutation.mutateAsync(data)
      setShowProjectForm(false)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleUpdateProject = async (data: any) => {
    if (!editingProject) return

    try {
      await updateProjectMutation.mutateAsync({
        id: editingProject.id,
        ...data
      })
      setEditingProject(null)
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleDeleteProject = async () => {
    if (!deletingProject) return

    try {
      await deleteProjectMutation.mutateAsync(deletingProject.id)
      setDeletingProject(null)
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const openDeleteDialog = (project: ProjectWithClient) => {
    setDeletingProject(project)
    setShowConfirmDialog(true)
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && statusFilter !== 'completed'
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please sign in to view projects.
          </p>
          <Button asChild>
            <Link to="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Projects
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {error.message || 'Failed to load projects. Please try again.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Projects</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your projects and track their progress
          </p>
        </div>
        <Button
          onClick={() => setShowProjectForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 button-glow hover-lift"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search projects by name, description, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FiFlag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first project.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
              <Button
                onClick={() => setShowProjectForm(true)}
                className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const statusInfo = statusConfig[project.status as keyof typeof statusConfig]
            const priorityInfo = priorityConfig[(project as any).priority as keyof typeof priorityConfig]
            const StatusIcon = statusInfo.icon
            const overdue = isOverdue(project.due_date)

            return (
              <Card key={project.id} className="card-hover group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${statusInfo.color} text-xs font-medium flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                        <Badge className={`${priorityInfo.color} text-xs font-medium`}>
                          {priorityInfo.label}
                        </Badge>
                        {overdue && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-xs font-medium">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Description */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="line-clamp-2">{project.description}</p>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <FiUser className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{project.client?.name || 'No client assigned'}</span>
                  </div>

                  {/* Budget */}
                  {project.budget && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FiDollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{formatCurrency(project.budget)}</span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-1">
                    {project.due_date && (
                      <div className={`flex items-center text-xs ${overdue ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        <FiCalendar className="w-3 h-3 mr-1" />
                        <span>Due: {formatDate(project.due_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}

                  {/* Created Date */}
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    <span>Created {formatDate(project.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingProject(project)}
                    >
                      <FiEdit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/projects/${project.id}`}>
                        <FiEye className="w-3 h-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      onClick={() => openDeleteDialog(project)}
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectForm
              project={null}
              onSave={handleCreateProject}
              onCancel={() => setShowProjectForm(false)}
              isLoading={createProjectMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectForm
              project={editingProject}
              onSave={handleUpdateProject}
              onCancel={() => setEditingProject(null)}
              isLoading={updateProjectMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

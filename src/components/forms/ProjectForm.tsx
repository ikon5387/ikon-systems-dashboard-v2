import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiX, FiSave, FiCalendar, FiDollarSign, FiFlag, FiFileText } from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useClients } from '@/hooks/useClients'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Project, ProjectInsert, ProjectUpdate } from '@/services/projects/ProjectService'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  client_id: z.string().min(1, 'Client is required'),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  project?: Project | null
  onSave: (data: ProjectInsert | ProjectUpdate) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ProjectForm({ project, onSave, onCancel, isLoading = false }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: clients, isLoading: clientsLoading } = useClients()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      client_id: '',
      status: 'planning',
      priority: 'medium',
      budget: undefined,
      start_date: '',
      due_date: '',
      notes: ''
    }
  })

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description,
        client_id: project.client_id,
        status: project.status,
        priority: 'medium',
        budget: project.budget || undefined,
        start_date: '',
        due_date: project.due_date ? project.due_date.split('T')[0] : '',
        notes: ''
      })
    }
  }, [project, reset])

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      const formData = {
        name: data.name,
        description: data.description,
        client_id: data.client_id,
        status: data.status,
        budget: data.budget || 0,
        timeline: 'TBD',
        milestones: {},
        due_date: data.due_date || null
      }
      await onSave(formData)
    } catch (error) {
      console.error('Error saving project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {project ? 'Edit Project' : 'Create New Project'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <FiX className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <FiFileText className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Name *
              </label>
              <Input
                {...register('name')}
                placeholder="Enter project name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Client *
              </label>
              {clientsLoading ? (
                <div className="flex items-center justify-center h-10">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <select
                  {...register('client_id')}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.client_id ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <option value="">Select a client</option>
                  {clients?.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.client_id && (
                <p className="text-red-500 text-sm mt-1">{errors.client_id.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description *
            </label>
            <Textarea
              {...register('description')}
              placeholder="Describe the project..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <FiFlag className="w-5 h-5 mr-2" />
            Project Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FiDollarSign className="w-4 h-4 inline mr-1" />
                Budget
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('budget', { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.budget ? 'border-red-500' : ''}
              />
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FiCalendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <Input
                type="date"
                {...register('start_date')}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FiCalendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <Input
                type="date"
                {...register('due_date')}
                className={errors.due_date ? 'border-red-500' : ''}
              />
              {errors.due_date && (
                <p className="text-red-500 text-sm mt-1">{errors.due_date.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <FiFileText className="w-5 h-5 mr-2" />
            Additional Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <Textarea
              {...register('notes')}
              placeholder="Additional notes or comments..."
              rows={3}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            {isSubmitting || isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <FiSave className="w-4 h-4 mr-2" />
            )}
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  )
}

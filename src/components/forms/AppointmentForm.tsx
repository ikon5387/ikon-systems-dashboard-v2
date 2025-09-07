import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiX, FiSave, FiCalendar, FiClock, FiFileText, FiMapPin } from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useClients } from '@/hooks/useClients'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Appointment, AppointmentInsert, AppointmentUpdate } from '@/services/appointments/AppointmentService'

const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  client_id: z.string().min(1, 'Client is required'),
  type: z.enum(['demo', 'call', 'meeting', 'follow_up', 'consultation']),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled']),
  scheduled_at: z.string().min(1, 'Date and time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  google_calendar_sync: z.boolean().optional()
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  appointment?: Appointment | null
  onSave: (data: AppointmentInsert | AppointmentUpdate) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function AppointmentForm({ appointment, onSave, onCancel, isLoading = false }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: clients, isLoading: clientsLoading } = useClients()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      description: '',
      client_id: '',
      type: 'meeting',
      status: 'scheduled',
      scheduled_at: '',
      duration: 60,
      location: '',
      notes: '',
      google_calendar_sync: true
    }
  })


  useEffect(() => {
    if (appointment) {
      const scheduledDate = new Date(appointment.date_time)
      const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
      
      reset({
        title: appointment.title || '',
        description: appointment.description || '',
        client_id: appointment.client_id,
        type: appointment.type,
        status: appointment.status === 'no_show' ? 'cancelled' : appointment.status,
        scheduled_at: localDateTime.toISOString().slice(0, 16),
        duration: 60,
        location: '',
        notes: appointment.notes || '',
        google_calendar_sync: false
      })
    }
  }, [appointment, reset])

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true)
    try {
      const formData = {
        client_id: data.client_id,
        date_time: new Date(data.scheduled_at).toISOString(),
        type: data.type,
        status: data.status === 'rescheduled' ? 'scheduled' : data.status,
        notes: data.notes || null
      }
      await onSave(formData)
    } catch (error) {
      console.error('Error saving appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = [
    { value: 'demo', label: 'Demo', icon: '🎯' },
    { value: 'call', label: 'Phone Call', icon: '📞' },
    { value: 'meeting', label: 'Meeting', icon: '🤝' },
    { value: 'follow_up', label: 'Follow-up', icon: '🔄' },
    { value: 'consultation', label: 'Consultation', icon: '💡' }
  ]

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
    { value: 'rescheduled', label: 'Rescheduled', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' }
  ]

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' }
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
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
                Title *
              </label>
              <Input
                {...register('title')}
                placeholder="Enter appointment title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
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
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Brief description of the appointment..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Scheduling Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <FiCalendar className="w-5 h-5 mr-2" />
            Scheduling Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FiCalendar className="w-4 h-4 inline mr-1" />
                Date & Time *
              </label>
              <Input
                type="datetime-local"
                {...register('scheduled_at')}
                className={errors.scheduled_at ? 'border-red-500' : ''}
              />
              {errors.scheduled_at && (
                <p className="text-red-500 text-sm mt-1">{errors.scheduled_at.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FiClock className="w-4 h-4 inline mr-1" />
                Duration
              </label>
              <select
                {...register('duration', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                <FiMapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <Input
                {...register('location')}
                placeholder="Meeting location or video call link"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
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
              placeholder="Additional notes or preparation instructions..."
              rows={4}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="google_calendar_sync"
              {...register('google_calendar_sync')}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="google_calendar_sync" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Sync with Google Calendar
            </label>
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
            {appointment ? 'Update Appointment' : 'Schedule Appointment'}
          </Button>
        </div>
      </form>
    </div>
  )
}

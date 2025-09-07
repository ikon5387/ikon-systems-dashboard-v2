import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  FiX, 
  FiSave, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiFileText,
  FiTag
} from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Client } from '@/services/clients/ClientService'

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['lead', 'prospect', 'active', 'churned']).default('lead'),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  client?: Client | null
  onSave: (data: ClientFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ClientForm({ client, onSave, onCancel, isLoading = false }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'lead',
      notes: '',
    }
  })

  useEffect(() => {
    if (client) {
      setValue('name', client.name)
      setValue('email', client.email)
      setValue('phone', client.phone || '')
      setValue('address', client.address || '')
      setValue('status', client.status)
      setValue('notes', client.notes || '')
    } else {
      reset()
    }
  }, [client, setValue, reset])

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      await onSave(data)
    } catch (error) {
      console.error('Failed to save client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {client ? 'Edit Client' : 'Add New Client'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <FiX className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FiUser className="w-5 h-5 mr-2 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    {...register('name')}
                    placeholder="Enter full name"
                    className="pl-10"
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Enter email address"
                    className="pl-10"
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="Enter phone number"
                  className="pl-10"
                  disabled={isSubmitting || isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Address
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  {...register('address')}
                  placeholder="Enter address"
                  className="pl-10"
                  disabled={isSubmitting || isLoading}
                />
              </div>
              {errors.address && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status and Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FiTag className="w-5 h-5 mr-2 text-primary" />
              Status & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting || isLoading}
              >
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="churned">Churned</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Notes
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full px-3 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                  placeholder="Enter any additional notes..."
                  disabled={isSubmitting || isLoading}
                />
              </div>
              {errors.notes && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
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
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <>
                <FiSave className="w-4 h-4 mr-2" />
                {client ? 'Update Client' : 'Create Client'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

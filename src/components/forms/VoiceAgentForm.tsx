import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiX, FiSave, FiSettings, FiMessageSquare, FiClock, FiGlobe } from 'react-icons/fi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { VoiceAgent, VoiceAgentInsert, VoiceAgentUpdate } from '@/services/voice-agents/VoiceAgentService'

const voiceAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.enum(['sales', 'support', 'appointment', 'follow_up', 'custom']),
  status: z.enum(['active', 'inactive', 'training', 'error']),
  model: z.string().min(1, 'Model is required'),
  voice: z.string().min(1, 'Voice is required'),
  first_message: z.string().min(1, 'First message is required').max(500, 'First message must be less than 500 characters'),
  system_message: z.string().min(1, 'System message is required').max(1000, 'System message must be less than 1000 characters'),
  max_duration: z.number().min(30, 'Max duration must be at least 30 seconds').max(1800, 'Max duration cannot exceed 30 minutes'),
  webhook_url: z.string().url('Invalid webhook URL').optional().or(z.literal('')),
  language: z.string().min(1, 'Language is required'),
  temperature: z.number().min(0, 'Temperature must be at least 0').max(2, 'Temperature cannot exceed 2'),
  max_tokens: z.number().min(1, 'Max tokens must be at least 1').max(4000, 'Max tokens cannot exceed 4000'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
})

type VoiceAgentFormData = z.infer<typeof voiceAgentSchema>

interface VoiceAgentFormProps {
  voiceAgent?: VoiceAgent | null
  onSave: (data: VoiceAgentInsert | VoiceAgentUpdate) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function VoiceAgentForm({ voiceAgent, onSave, onCancel, isLoading = false }: VoiceAgentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<VoiceAgentFormData>({
    resolver: zodResolver(voiceAgentSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'sales',
      status: 'inactive',
      model: 'gpt-4',
      voice: 'alloy',
      first_message: 'Hello! How can I help you today?',
      system_message: 'You are a helpful AI assistant. Be professional, friendly, and helpful.',
      max_duration: 300,
      webhook_url: '',
      language: 'en',
      temperature: 0.7,
      max_tokens: 1000,
      notes: ''
    }
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (voiceAgent) {
      reset({
        name: voiceAgent.name,
        description: voiceAgent.description || '',
        type: voiceAgent.type,
        status: voiceAgent.status,
        model: voiceAgent.model || 'gpt-4',
        voice: voiceAgent.voice || 'alloy',
        first_message: voiceAgent.first_message || 'Hello! How can I help you today?',
        system_message: voiceAgent.system_message || 'You are a helpful AI assistant.',
        max_duration: voiceAgent.max_duration || 300,
        webhook_url: voiceAgent.webhook_url || '',
        language: voiceAgent.language || 'en',
        temperature: voiceAgent.temperature || 0.7,
        max_tokens: voiceAgent.max_tokens || 1000,
        notes: voiceAgent.notes || ''
      })
    }
  }, [voiceAgent, reset])

  const onSubmit = async (data: VoiceAgentFormData) => {
    setIsSubmitting(true)
    try {
      const formData = {
        ...data,
        description: data.description || null,
        webhook_url: data.webhook_url || null,
        notes: data.notes || null
      }
      await onSave(formData)
    } catch (error) {
      console.error('Error saving voice agent:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = [
    { value: 'sales', label: 'Sales', icon: '💰', description: 'Lead generation and sales calls' },
    { value: 'support', label: 'Support', icon: '🛠️', description: 'Customer support and assistance' },
    { value: 'appointment', label: 'Appointment', icon: '📅', description: 'Schedule appointments and meetings' },
    { value: 'follow_up', label: 'Follow-up', icon: '🔄', description: 'Follow-up calls and reminders' },
    { value: 'custom', label: 'Custom', icon: '⚙️', description: 'Custom use case' }
  ]

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' },
    { value: 'training', label: 'Training', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'error', label: 'Error', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
  ]

  const modelOptions = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
  ]

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
    { value: 'nova', label: 'Nova' },
    { value: 'shimmer', label: 'Shimmer' }
  ]

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
  ]

  const getTypeSpecificSystemMessage = (type: string) => {
    switch (type) {
      case 'sales':
        return 'You are a professional sales representative. Your goal is to understand the customer\'s needs and present our services in a compelling way. Be consultative, not pushy. Ask qualifying questions and listen carefully to responses.'
      case 'support':
        return 'You are a helpful customer support representative. Your goal is to resolve customer issues quickly and efficiently. Be patient, empathetic, and solution-oriented. If you cannot resolve an issue, escalate it appropriately.'
      case 'appointment':
        return 'You are a professional appointment scheduler. Your goal is to find a convenient time for the customer to meet with our team. Be flexible and accommodating while maintaining our availability constraints.'
      case 'follow_up':
        return 'You are a professional follow-up specialist. Your goal is to check in with customers, gather feedback, and identify opportunities for continued engagement. Be friendly and genuine in your approach.'
      default:
        return 'You are a helpful AI assistant. Be professional, friendly, and helpful.'
    }
  }

  const getTypeSpecificFirstMessage = (type: string) => {
    switch (type) {
      case 'sales':
        return 'Hello! I\'m calling from Ikon Systems. I hope I\'m not catching you at a bad time. I wanted to reach out because we help businesses like yours streamline their operations and increase efficiency. Do you have a few minutes to chat?'
      case 'support':
        return 'Hello! This is your AI support assistant from Ikon Systems. I\'m here to help you with any questions or issues you might have. How can I assist you today?'
      case 'appointment':
        return 'Hello! I\'m calling from Ikon Systems to help you schedule an appointment. We\'d love to show you how our services can benefit your business. When would be a good time for a brief consultation?'
      case 'follow_up':
        return 'Hello! I\'m calling from Ikon Systems to follow up on our recent interaction. I wanted to check in and see how things are going. Do you have a moment to chat?'
      default:
        return 'Hello! How can I help you today?'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {voiceAgent ? 'Edit Voice Agent' : 'Create New Voice Agent'}
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
            <FiSettings className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Agent Name *
              </label>
              <Input
                {...register('name')}
                placeholder="Enter agent name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type *
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

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Describe the agent's purpose and use case..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
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
                Language
              </label>
              <select
                {...register('language')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <FiMessageSquare className="w-5 h-5 mr-2" />
            AI Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Model *
              </label>
              <select
                {...register('model')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {modelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Voice *
              </label>
              <select
                {...register('voice')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {voiceOptions.map((option) => (
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
                Temperature
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                {...register('temperature', { valueAsNumber: true })}
                className={errors.temperature ? 'border-red-500' : ''}
              />
              {errors.temperature && (
                <p className="text-red-500 text-sm mt-1">{errors.temperature.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Max Tokens
              </label>
              <Input
                type="number"
                min="1"
                max="4000"
                {...register('max_tokens', { valueAsNumber: true })}
                className={errors.max_tokens ? 'border-red-500' : ''}
              />
              {errors.max_tokens && (
                <p className="text-red-500 text-sm mt-1">{errors.max_tokens.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FiClock className="w-4 h-4 inline mr-1" />
                Max Duration (seconds)
              </label>
              <Input
                type="number"
                min="30"
                max="1800"
                {...register('max_duration', { valueAsNumber: true })}
                className={errors.max_duration ? 'border-red-500' : ''}
              />
              {errors.max_duration && (
                <p className="text-red-500 text-sm mt-1">{errors.max_duration.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <FiMessageSquare className="w-5 h-5 mr-2" />
            Messages
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              First Message *
            </label>
            <Textarea
              {...register('first_message')}
              placeholder="The first message the agent will say when a call is answered"
              rows={3}
              className={errors.first_message ? 'border-red-500' : ''}
            />
            {errors.first_message && (
              <p className="text-red-500 text-sm mt-1">{errors.first_message.message}</p>
            )}
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMessage = getTypeSpecificFirstMessage(selectedType)
                  // Update the form field
                  const event = { target: { value: newMessage } } as any
                  register('first_message').onChange(event)
                }}
              >
                Use {typeOptions.find(t => t.value === selectedType)?.label} Template
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              System Message *
            </label>
            <Textarea
              {...register('system_message')}
              placeholder="Instructions for how the agent should behave"
              rows={4}
              className={errors.system_message ? 'border-red-500' : ''}
            />
            {errors.system_message && (
              <p className="text-red-500 text-sm mt-1">{errors.system_message.message}</p>
            )}
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMessage = getTypeSpecificSystemMessage(selectedType)
                  // Update the form field
                  const event = { target: { value: newMessage } } as any
                  register('system_message').onChange(event)
                }}
              >
                Use {typeOptions.find(t => t.value === selectedType)?.label} Template
              </Button>
            </div>
          </div>
        </div>

        {/* Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <FiGlobe className="w-5 h-5 mr-2" />
            Integration
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Webhook URL
            </label>
            <Input
              {...register('webhook_url')}
              placeholder="https://your-domain.com/webhook"
              className={errors.webhook_url ? 'border-red-500' : ''}
            />
            {errors.webhook_url && (
              <p className="text-red-500 text-sm mt-1">{errors.webhook_url.message}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Optional: URL to receive call events and data
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <FiMessageSquare className="w-5 h-5 mr-2" />
            Additional Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <Textarea
              {...register('notes')}
              placeholder="Additional notes or configuration details..."
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
            {voiceAgent ? 'Update Agent' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </div>
  )
}

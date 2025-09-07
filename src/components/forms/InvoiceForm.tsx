import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiX, FiUser, FiDollarSign, FiCalendar, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useClients } from '@/hooks/useClients'
import type { InvoiceInsert } from '@/services/financials/FinancialService'

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unit_price: z.number().min(0, 'Unit price must be positive'),
    total: z.number().min(0, 'Total must be positive')
  })).min(1, 'At least one item is required'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax_rate: z.number().min(0).max(100, 'Tax rate cannot exceed 100%'),
  tax_amount: z.number().min(0, 'Tax amount must be positive'),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  notes: z.string().optional()
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  invoice?: any
  onSave: (data: InvoiceInsert) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function InvoiceForm({ invoice, onSave, onCancel, isLoading = false }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: clients } = useClients()
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_id: '',
      invoice_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
      subtotal: 0,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: 0,
      notes: ''
    }
  })

  const watchedItems = watch('items')
  const watchedTaxRate = watch('tax_rate')

  useEffect(() => {
    if (invoice) {
      reset({
        client_id: invoice.client_id || '',
        invoice_number: invoice.invoice_number || '',
        issue_date: invoice.issue_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: invoice.status || 'draft',
        items: invoice.items || [{ description: '', quantity: 1, unit_price: 0, total: 0 }],
        subtotal: invoice.subtotal || 0,
        tax_rate: invoice.tax_rate || 0,
        tax_amount: invoice.tax_amount || 0,
        total_amount: invoice.total_amount || 0,
        notes: invoice.notes || ''
      })
    }
  }, [invoice, reset])

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const taxAmount = (subtotal * watchedTaxRate) / 100
    const total = subtotal + taxAmount

    setValue('subtotal', subtotal)
    setValue('tax_amount', taxAmount)
    setValue('total_amount', total)
  }, [watchedItems, watchedTaxRate, setValue])

  const addItem = () => {
    const currentItems = watch('items')
    setValue('items', [...currentItems, { description: '', quantity: 1, unit_price: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    const currentItems = watch('items')
    if (currentItems.length > 1) {
      setValue('items', currentItems.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const currentItems = watch('items')
    const updatedItems = [...currentItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price
    }
    
    setValue('items', updatedItems)
  }

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true)
    try {
      const formData = {
        invoice_number: data.invoice_number,
        client_id: data.client_id,
        title: data.items[0]?.description || 'Invoice',
        description: data.notes || null,
        amount: data.subtotal,
        tax_rate: data.tax_rate,
        total_amount: data.total_amount,
        status: data.status,
        due_date: data.due_date,
        notes: data.notes || null
      }
      await onSave(formData)
    } catch (error) {
      console.error('Error saving invoice:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {invoice ? 'Edit Invoice' : 'Create New Invoice'}
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
              <FiFileText className="w-5 h-5 mr-2 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Client *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select
                    {...register('client_id')}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isSubmitting || isLoading}
                  >
                    <option value="">Select a client</option>
                    {clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.client_id && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.client_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Invoice Number *
                </label>
                <Input
                  {...register('invoice_number')}
                  placeholder="INV-001"
                  disabled={isSubmitting || isLoading}
                />
                {errors.invoice_number && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.invoice_number.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Issue Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    {...register('issue_date')}
                    type="date"
                    className="pl-10"
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                {errors.issue_date && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.issue_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Due Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    {...register('due_date')}
                    type="date"
                    className="pl-10"
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                {errors.due_date && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.due_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isSubmitting || isLoading}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <FiDollarSign className="w-5 h-5 mr-2 text-primary" />
                Invoice Items
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={isSubmitting || isLoading}
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Unit Price
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    disabled={isSubmitting || isLoading}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Total
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.total}
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  {watchedItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      disabled={isSubmitting || isLoading}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {errors.items && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.items.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FiDollarSign className="w-5 h-5 mr-2 text-primary" />
              Totals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Subtotal
                </label>
                <Input
                  {...register('subtotal', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  readOnly
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tax Rate (%)
                </label>
                <Input
                  {...register('tax_rate', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  disabled={isSubmitting || isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tax Amount
                </label>
                <Input
                  {...register('tax_amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  readOnly
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Total Amount
                </label>
                <Input
                  {...register('total_amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  readOnly
                  className="bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FiFileText className="w-5 h-5 mr-2 text-primary" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Additional Notes
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                placeholder="Any additional notes or terms..."
                disabled={isSubmitting || isLoading}
              />
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
                <FiFileText className="w-4 h-4 mr-2" />
                {invoice ? 'Update Invoice' : 'Create Invoice'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

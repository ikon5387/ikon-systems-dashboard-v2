import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FinancialService, type InvoiceInsert, type PaymentInsert, type ExpenseInsert, type InvoiceUpdate, type FinancialFilters } from '@/services/financials/FinancialService'
import { notifications } from '@/lib/notifications'

// Query Keys
export const financialKeys = {
  all: ['financials'] as const,
  invoices: () => [...financialKeys.all, 'invoices'] as const,
  invoiceList: (filters?: FinancialFilters) => [...financialKeys.invoices(), { filters }] as const,
  invoiceDetail: (id: string) => [...financialKeys.invoices(), 'detail', id] as const,
  payments: () => [...financialKeys.all, 'payments'] as const,
  paymentList: (filters?: FinancialFilters) => [...financialKeys.payments(), { filters }] as const,
  expenses: () => [...financialKeys.all, 'expenses'] as const,
  expenseList: (filters?: FinancialFilters) => [...financialKeys.expenses(), { filters }] as const,
  stats: () => [...financialKeys.all, 'stats'] as const,
  revenueData: (months: number) => [...financialKeys.all, 'revenue', months] as const,
}

// Invoice Hooks
export function useInvoices(filters?: FinancialFilters) {
  return useQuery({
    queryKey: financialKeys.invoiceList(filters),
    queryFn: () => FinancialService.getInvoices(filters),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: financialKeys.invoiceDetail(id),
    queryFn: () => FinancialService.getInvoice(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InvoiceInsert) => FinancialService.createInvoice(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate and refetch invoice lists
        queryClient.invalidateQueries({ queryKey: financialKeys.invoices() })
        queryClient.invalidateQueries({ queryKey: financialKeys.stats() })
        queryClient.invalidateQueries({ queryKey: financialKeys.revenueData(12) })

        notifications.success('Invoice created successfully!')
      } else {
        notifications.error(response.error || 'Failed to create invoice')
      }
    },
    onError: (error) => {
      console.error('Error creating invoice:', error)
      notifications.error('Failed to create invoice')
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & InvoiceUpdate) =>
      FinancialService.updateInvoice(id, data),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update the specific invoice in cache
        queryClient.setQueryData(
          financialKeys.invoiceDetail(variables.id),
          response.data
        )

        // Invalidate lists to refetch
        queryClient.invalidateQueries({ queryKey: financialKeys.invoices() })
        queryClient.invalidateQueries({ queryKey: financialKeys.stats() })
        queryClient.invalidateQueries({ queryKey: financialKeys.revenueData(12) })

        notifications.success('Invoice updated successfully!')
      } else {
        notifications.error(response.error || 'Failed to update invoice')
      }
    },
    onError: (error) => {
      console.error('Error updating invoice:', error)
      notifications.error('Failed to update invoice')
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => FinancialService.deleteInvoice(id),
    onSuccess: (response, id) => {
      if (response.data) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: financialKeys.invoiceDetail(id) })

        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: financialKeys.invoices() })
        queryClient.invalidateQueries({ queryKey: financialKeys.stats() })
        queryClient.invalidateQueries({ queryKey: financialKeys.revenueData(12) })

        notifications.success('Invoice deleted successfully!')
      } else {
        notifications.error(response.error || 'Failed to delete invoice')
      }
    },
    onError: (error) => {
      console.error('Error deleting invoice:', error)
      notifications.error('Failed to delete invoice')
    },
  })
}

// Payment Hooks
export function usePayments(filters?: FinancialFilters) {
  return useQuery({
    queryKey: financialKeys.paymentList(filters),
    queryFn: () => FinancialService.getPayments(filters),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaymentInsert) => FinancialService.createPayment(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate and refetch payment lists
        queryClient.invalidateQueries({ queryKey: financialKeys.payments() })
        queryClient.invalidateQueries({ queryKey: financialKeys.invoices() })
        queryClient.invalidateQueries({ queryKey: financialKeys.stats() })
        queryClient.invalidateQueries({ queryKey: financialKeys.revenueData(12) })

        notifications.success('Payment recorded successfully!')
      } else {
        notifications.error(response.error || 'Failed to record payment')
      }
    },
    onError: (error) => {
      console.error('Error creating payment:', error)
      notifications.error('Failed to record payment')
    },
  })
}

// Expense Hooks
export function useExpenses(filters?: FinancialFilters) {
  return useQuery({
    queryKey: financialKeys.expenseList(filters),
    queryFn: () => FinancialService.getExpenses(filters),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ExpenseInsert) => FinancialService.createExpense(data),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate and refetch expense lists
        queryClient.invalidateQueries({ queryKey: financialKeys.expenses() })
        queryClient.invalidateQueries({ queryKey: financialKeys.stats() })
        queryClient.invalidateQueries({ queryKey: financialKeys.revenueData(12) })

        notifications.success('Expense recorded successfully!')
      } else {
        notifications.error(response.error || 'Failed to record expense')
      }
    },
    onError: (error) => {
      console.error('Error creating expense:', error)
      notifications.error('Failed to record expense')
    },
  })
}

// Financial Statistics
export function useFinancialStats() {
  return useQuery({
    queryKey: financialKeys.stats(),
    queryFn: () => FinancialService.getFinancialStats(),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useRevenueData(months: number = 12) {
  return useQuery({
    queryKey: financialKeys.revenueData(months),
    queryFn: () => FinancialService.getRevenueData(months),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000,
  })
}

// Real-time hooks
export function useFinancialRealtime() {
  const queryClient = useQueryClient()

  return {
    subscribeToInvoices: () => {
      return FinancialService.subscribeToInvoices((payload) => {
        console.log('Invoice real-time update:', payload)

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: financialKeys.invoices() })
        queryClient.invalidateQueries({ queryKey: financialKeys.stats() })
        queryClient.invalidateQueries({ queryKey: financialKeys.revenueData(12) })

        // Update specific invoice if it's in cache
        if (payload.new && payload.new.id) {
          queryClient.setQueryData(
            financialKeys.invoiceDetail(payload.new.id),
            payload.new
          )
        }
      })
    },

    subscribeToPayments: () => {
      return FinancialService.subscribeToPayments((payload) => {
        console.log('Payment real-time update:', payload)
        queryClient.invalidateQueries({ queryKey: financialKeys.payments() })
        queryClient.invalidateQueries({ queryKey: financialKeys.invoices() })
        queryClient.invalidateQueries({ queryKey: financialKeys.stats() })
        queryClient.invalidateQueries({ queryKey: financialKeys.revenueData(12) })
      })
    },

    subscribeToExpenses: () => {
      return FinancialService.subscribeToExpenses((payload) => {
        console.log('Expense real-time update:', payload)
        queryClient.invalidateQueries({ queryKey: financialKeys.expenses() })
        queryClient.invalidateQueries({ queryKey: financialKeys.stats() })
        queryClient.invalidateQueries({ queryKey: financialKeys.revenueData(12) })
      })
    }
  }
}

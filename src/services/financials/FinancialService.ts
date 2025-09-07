import { BaseService, ServiceResponse, FilterParams, PaginationParams } from '../base/BaseService'
import { supabase } from '@/lib/supabase'
import type { Tables, InsertDto, UpdateDto } from '@/lib/supabase'

export type Invoice = Tables<'invoices'>
export type Payment = Tables<'payments'>
export type Expense = Tables<'expenses'>
export type InvoiceInsert = InsertDto<'invoices'>
export type PaymentInsert = InsertDto<'payments'>
export type ExpenseInsert = InsertDto<'expenses'>
export type InvoiceUpdate = UpdateDto<'invoices'>
export type PaymentUpdate = UpdateDto<'payments'>
export type ExpenseUpdate = UpdateDto<'expenses'>

export interface FinancialFilters extends FilterParams {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  type?: 'invoice' | 'payment' | 'expense'
  client_id?: string
  date_from?: string
  date_to?: string
  amount_min?: number
  amount_max?: number
}

export interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  outstandingInvoices: number
  overdueInvoices: number
  monthlyRevenue: number
  monthlyExpenses: number
  revenueGrowth: number
  expenseGrowth: number
}

export interface RevenueData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

class FinancialServiceClass extends BaseService {
  protected tableName = 'invoices'

  // Invoice operations
  async getInvoices(filters?: FinancialFilters, pagination?: PaginationParams): Promise<ServiceResponse<Invoice[]>> {
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          clients (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.client_id) {
          query = query.eq('client_id', filters.client_id)
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from)
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to)
        }
        if (filters.amount_min) {
          query = query.gte('total_amount', filters.amount_min)
        }
        if (filters.amount_max) {
          query = query.lte('total_amount', filters.amount_max)
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
        console.error('Error fetching invoices:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getInvoices:', error)
      return { data: null, error: 'Failed to fetch invoices', success: false }
    }
  }

  async getInvoice(id: string): Promise<ServiceResponse<Invoice>> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone,
            address
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching invoice:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in getInvoice:', error)
      return { data: null, error: 'Failed to fetch invoice', success: false }
    }
  }

  async createInvoice(invoiceData: InvoiceInsert): Promise<ServiceResponse<Invoice>> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single()

      if (error) {
        console.error('Error creating invoice:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in createInvoice:', error)
      return { data: null, error: 'Failed to create invoice', success: false }
    }
  }

  async updateInvoice(id: string, updates: InvoiceUpdate): Promise<ServiceResponse<Invoice>> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ ...(updates as any), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating invoice:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in updateInvoice:', error)
      return { data: null, error: 'Failed to update invoice', success: false }
    }
  }

  async deleteInvoice(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting invoice:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: true, error: null, success: true }
    } catch (error) {
      console.error('Error in deleteInvoice:', error)
      return { data: null, error: 'Failed to delete invoice', success: false }
    }
  }

  // Payment operations
  async getPayments(filters?: FinancialFilters, pagination?: PaginationParams): Promise<ServiceResponse<Payment[]>> {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          invoices (
            id,
            invoice_number,
            total_amount
          ),
          clients (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters) {
        if (filters.client_id) {
          query = query.eq('client_id', filters.client_id)
        }
        if (filters.date_from) {
          query = query.gte('payment_date', filters.date_from)
        }
        if (filters.date_to) {
          query = query.lte('payment_date', filters.date_to)
        }
        if (filters.amount_min) {
          query = query.gte('amount', filters.amount_min)
        }
        if (filters.amount_max) {
          query = query.lte('amount', filters.amount_max)
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
        console.error('Error fetching payments:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getPayments:', error)
      return { data: null, error: 'Failed to fetch payments', success: false }
    }
  }

  async createPayment(paymentData: PaymentInsert): Promise<ServiceResponse<Payment>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) {
        console.error('Error creating payment:', error)
        return { data: null, error: error.message, success: false }
      }

      // Update invoice status if fully paid
      if ((paymentData as any).invoice_id) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('id', (paymentData as any).invoice_id)
          .single()

        if (invoice) {
          const { data: totalPaid } = await supabase
            .from('payments')
            .select('amount')
            .eq('invoice_id', (paymentData as any).invoice_id)

          const paidAmount = totalPaid?.reduce((sum, payment) => sum + payment.amount, 0) || 0

          if (paidAmount >= invoice.total_amount) {
            await supabase
              .from('invoices')
              .update({ status: 'paid', updated_at: new Date().toISOString() })
              .eq('id', (paymentData as any).invoice_id)
          }
        }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in createPayment:', error)
      return { data: null, error: 'Failed to create payment', success: false }
    }
  }

  // Expense operations
  async getExpenses(filters?: FinancialFilters, pagination?: PaginationParams): Promise<ServiceResponse<Expense[]>> {
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters) {
        if (filters.date_from) {
          query = query.gte('expense_date', filters.date_from)
        }
        if (filters.date_to) {
          query = query.lte('expense_date', filters.date_to)
        }
        if (filters.amount_min) {
          query = query.gte('amount', filters.amount_min)
        }
        if (filters.amount_max) {
          query = query.lte('amount', filters.amount_max)
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
        console.error('Error fetching expenses:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: data || [], error: null, success: true }
    } catch (error) {
      console.error('Error in getExpenses:', error)
      return { data: null, error: 'Failed to fetch expenses', success: false }
    }
  }

  async createExpense(expenseData: ExpenseInsert): Promise<ServiceResponse<Expense>> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single()

      if (error) {
        console.error('Error creating expense:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data, error: null, success: true }
    } catch (error) {
      console.error('Error in createExpense:', error)
      return { data: null, error: 'Failed to create expense', success: false }
    }
  }

  // Financial statistics
  async getFinancialStats(): Promise<ServiceResponse<FinancialStats>> {
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.toISOString().slice(0, 7)
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().slice(0, 7)

      // Get total revenue
      const { data: totalRevenueData } = await supabase
        .from('payments')
        .select('amount')

      const totalRevenue = totalRevenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Get total expenses
      const { data: totalExpensesData } = await supabase
        .from('expenses')
        .select('amount')

      const totalExpenses = totalExpensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0

      // Get outstanding invoices
      const { data: outstandingInvoicesData } = await supabase
        .from('invoices')
        .select('total_amount')
        .in('status', ['sent', 'overdue'])

      const outstandingInvoices = outstandingInvoicesData?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0

      // Get overdue invoices
      const { data: overdueInvoicesData } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'overdue')

      const overdueInvoices = overdueInvoicesData?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0

      // Get monthly revenue
      const { data: monthlyRevenueData } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', `${currentMonth}-01`)
        .lt('payment_date', `${currentMonth}-32`)

      const monthlyRevenue = monthlyRevenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Get monthly expenses
      const { data: monthlyExpensesData } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', `${currentMonth}-01`)
        .lt('expense_date', `${currentMonth}-32`)

      const monthlyExpenses = monthlyExpensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0

      // Get last month's revenue for growth calculation
      const { data: lastMonthRevenueData } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', `${lastMonth}-01`)
        .lt('payment_date', `${lastMonth}-32`)

      const lastMonthRevenue = lastMonthRevenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Get last month's expenses for growth calculation
      const { data: lastMonthExpensesData } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', `${lastMonth}-01`)
        .lt('expense_date', `${lastMonth}-32`)

      const lastMonthExpenses = lastMonthExpensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0

      const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
      const expenseGrowth = lastMonthExpenses > 0 ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

      const stats: FinancialStats = {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        outstandingInvoices,
        overdueInvoices,
        monthlyRevenue,
        monthlyExpenses,
        revenueGrowth,
        expenseGrowth
      }

      return { data: stats, error: null, success: true }
    } catch (error) {
      console.error('Error in getFinancialStats:', error)
      return { data: null, error: 'Failed to fetch financial stats', success: false }
    }
  }

  // Revenue data for charts
  async getRevenueData(months: number = 12): Promise<ServiceResponse<RevenueData[]>> {
    try {
      const revenueData: RevenueData[] = []
      const currentDate = new Date()

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const month = date.toISOString().slice(0, 7)
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 7)

        // Get revenue for this month
        const { data: revenueData_month } = await supabase
          .from('payments')
          .select('amount')
          .gte('payment_date', `${month}-01`)
          .lt('payment_date', `${nextMonth}-01`)

        const revenue = revenueData_month?.reduce((sum, payment) => sum + payment.amount, 0) || 0

        // Get expenses for this month
        const { data: expensesData_month } = await supabase
          .from('expenses')
          .select('amount')
          .gte('expense_date', `${month}-01`)
          .lt('expense_date', `${nextMonth}-01`)

        const expenses = expensesData_month?.reduce((sum, expense) => sum + expense.amount, 0) || 0

        revenueData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
          expenses,
          profit: revenue - expenses
        })
      }

      return { data: revenueData, error: null, success: true }
    } catch (error) {
      console.error('Error in getRevenueData:', error)
      return { data: null, error: 'Failed to fetch revenue data', success: false }
    }
  }

  // Real-time subscriptions
  subscribeToInvoices(callback: (payload: any) => void) {
    return supabase
      .channel('invoices_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invoices'
      }, callback)
      .subscribe()
  }

  subscribeToPayments(callback: (payload: any) => void) {
    return supabase
      .channel('payments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments'
      }, callback)
      .subscribe()
  }

  subscribeToExpenses(callback: (payload: any) => void) {
    return supabase
      .channel('expenses_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses'
      }, callback)
      .subscribe()
  }
}

export const FinancialService = new FinancialServiceClass()

import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiPlus,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
  FiCreditCard,
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useFinancialStats } from '@/hooks/useFinancials'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatCurrency } from '@/lib/utils'
import { StripeService } from '@/services/integrations/StripeService'
import { StripeTab } from '@/components/integrations/StripeTab'
import { notifications } from '@/lib/notifications'
import type { Invoice } from '@/services/financials/FinancialService'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
}

const statusLabels = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled'
}

const statusIcons = {
  draft: FiFileText,
  sent: FiSend,
  paid: FiCheckCircle,
  overdue: FiAlertCircle,
  cancelled: FiXCircle
}

export function FinancialsPage() {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  // Stripe integration state
  const [stripeConnected, setStripeConnected] = useState(false)
  const [stripeCustomers, setStripeCustomers] = useState<any[]>([])
  const [stripePayments, setStripePayments] = useState<any[]>([])
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [activeTab, setActiveTab] = useState<'invoices' | 'stripe'>('invoices')

  const { data: invoices, isLoading, error } = useInvoices()
  const { data: stats } = useFinancialStats()
  const createInvoiceMutation = useCreateInvoice()
  const updateInvoiceMutation = useUpdateInvoice()
  const deleteInvoiceMutation = useDeleteInvoice()

  const stripeService = StripeService

  // Check Stripe connection on component mount
  useEffect(() => {
    checkStripeConnection()
  }, [])

  const checkStripeConnection = async () => {
    try {
      const response = await stripeService.getCustomers()
      setStripeConnected(response.success)
      if (response.success) {
        loadStripeData()
      }
    } catch (error) {
      console.error('Failed to check Stripe connection:', error)
    }
  }

  const loadStripeData = async () => {
    try {
      setLoadingStripe(true)
      const [customersResponse, paymentsResponse] = await Promise.all([
        stripeService.getCustomers(),
        stripeService.getPaymentHistory('', 20)
      ])
      
      if (customersResponse.success && customersResponse.data) {
        setStripeCustomers(customersResponse.data)
      }
      
      if (paymentsResponse.success && paymentsResponse.data) {
        setStripePayments(paymentsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load Stripe data:', error)
      notifications.error('Failed to load Stripe data')
    } finally {
      setLoadingStripe(false)
    }
  }

  const createStripePaymentIntent = async (amount: number, customerId?: string) => {
    try {
      const response = await stripeService.createPaymentIntent({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        customerId: customerId
      })
      if (response.success) {
        notifications.success('Payment intent created successfully')
        return response.data
      } else {
        notifications.error('Failed to create payment intent')
      }
    } catch (error) {
      notifications.error('Failed to create payment intent')
    }
  }

  const createStripeCustomer = async (email: string, name?: string) => {
    try {
      const response = await stripeService.createCustomer({
        email,
        name
      })
      if (response.success) {
        notifications.success('Customer created successfully')
        loadStripeData() // Refresh data
        return response.data
      } else {
        notifications.error('Failed to create customer')
      }
    } catch (error) {
      notifications.error('Failed to create customer')
    }
  }

  // Filter and search invoices
  const filteredInvoices = useMemo(() => {
    if (!invoices) return []

    return invoices.filter((invoice: any) => {
      const matchesSearch =
        invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clients?.email?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, searchQuery, statusFilter])

  const handleCreateInvoice = async (data: any) => {
    try {
      await createInvoiceMutation.mutateAsync(data)
      setShowInvoiceForm(false)
    } catch (error) {
      console.error('Failed to create invoice:', error)
    }
  }

  const handleUpdateInvoice = async (data: any) => {
    if (!editingInvoice) return

    try {
      await updateInvoiceMutation.mutateAsync({
        id: (editingInvoice as any).id,
        ...data
      })
      setEditingInvoice(null)
    } catch (error) {
      console.error('Failed to update invoice:', error)
    }
  }

  const handleDeleteInvoice = async () => {
    if (!deletingInvoice) return

    try {
      await deleteInvoiceMutation.mutateAsync((deletingInvoice as any).id)
      setDeletingInvoice(null)
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Failed to delete invoice:', error)
    }
  }

  const openDeleteDialog = (invoice: Invoice) => {
    setDeletingInvoice(invoice)
    setShowConfirmDialog(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please sign in to view financial data.
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
        <LoadingSpinner size="lg" text="Loading financial data..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Financial Data
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {error.message || 'Failed to load financial data. Please try again.'}
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
          <h1 className="text-3xl font-bold gradient-text">Financials</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage invoices, payments, and track your business finances
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button
            onClick={() => setShowInvoiceForm(true)}
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 button-glow hover-lift"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
          {stripeConnected && (
            <Button
              onClick={loadStripeData}
              variant="outline"
              disabled={loadingStripe}
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loadingStripe ? 'animate-spin' : ''}`} />
              Sync Stripe
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FiFileText className="w-4 h-4" />
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('stripe')}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stripe'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FiCreditCard className="w-4 h-4" />
            Stripe
            {stripeConnected ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs">
                Connected
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 text-xs">
                Disconnected
              </Badge>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'invoices' && (
        <>
      {/* Financial Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Total Revenue
              </CardTitle>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <FiDollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <FiTrendingUp className="w-3 h-3 mr-1" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{stats.revenueGrowth.toFixed(1)}%
                </span> this month
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                Total Expenses
              </CardTitle>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <FiFileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(stats.totalExpenses)}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center mt-1">
                <FiTrendingDown className="w-3 h-3 mr-1" />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {stats.expenseGrowth.toFixed(1)}%
                </span> this month
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Net Profit
              </CardTitle>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(stats.netProfit)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                <FiTrendingUp className="w-3 h-3 mr-1" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {stats.netProfit > 0 ? 'Profitable' : 'Loss'}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Outstanding
              </CardTitle>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <FiClock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {formatCurrency(stats.outstandingInvoices)}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                <FiAlertCircle className="w-3 h-3 mr-1" />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {formatCurrency(stats.overdueInvoices)}
                </span> overdue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search invoices by number, client name, or email..."
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
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FiFileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first invoice.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button
                onClick={() => setShowInvoiceForm(true)}
                className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Create Your First Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredInvoices.map((invoice: any) => {
            const StatusIcon = statusIcons[invoice.status as keyof typeof statusIcons]
            return (
              <Card key={invoice.id} className="card-hover group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                        {invoice.invoice_number}
                      </CardTitle>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge
                          className={`${statusColors[invoice.status as keyof typeof statusColors]} text-xs font-medium flex items-center`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusLabels[invoice.status as keyof typeof statusLabels]}
                        </Badge>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {formatCurrency(invoice.total_amount)}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Client Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FiFileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">{invoice.clients?.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FiCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Due {formatDate(invoice.due_date)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="line-clamp-2">{invoice.notes}</p>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    <span>Created {formatDate(invoice.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingInvoice(invoice)}
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
                      <Link to={`/financials/invoices/${invoice.id}`}>
                        <FiEye className="w-3 h-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                      <FiDownload className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      onClick={() => openDeleteDialog(invoice)}
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

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <InvoiceForm
              invoice={null}
              onSave={handleCreateInvoice}
              onCancel={() => setShowInvoiceForm(false)}
              isLoading={createInvoiceMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <InvoiceForm
              invoice={editingInvoice}
              onSave={handleUpdateInvoice}
              onCancel={() => setEditingInvoice(null)}
              isLoading={updateInvoiceMutation.isPending}
            />
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'stripe' && (
        <StripeTab 
          connected={stripeConnected}
          customers={stripeCustomers}
          payments={stripePayments}
          loading={loadingStripe}
          onRefresh={loadStripeData}
          onCreatePaymentIntent={createStripePaymentIntent}
          onCreateCustomer={createStripeCustomer}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteInvoice}
        title="Delete Invoice"
        message={`Are you sure you want to delete this invoice? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

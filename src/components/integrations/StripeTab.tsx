import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StripeTabProps {
  connected: boolean
  customers: any[]
  payments: any[]
  loading: boolean
  onRefresh: () => void
  onCreatePaymentIntent: (amount: number, customerId?: string) => void
  onCreateCustomer: (email: string, name?: string) => void
}

export function StripeTab({ 
  connected, 
  customers, 
  payments, 
  loading, 
  onRefresh,
  onCreatePaymentIntent,
  onCreateCustomer
}: StripeTabProps) {
  const [showKeys, setShowKeys] = useState(false)
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')

  const maskKey = (key: string) => {
    if (!key) return 'Not configured'
    if (showKeys) return key
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4)
  }

  const handleCreateCustomer = async () => {
    if (!newCustomerEmail) return
    
    await onCreateCustomer(newCustomerEmail, newCustomerName || undefined)
    setNewCustomerEmail('')
    setNewCustomerName('')
    setShowCreateCustomer(false)
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Stripe Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                Not Connected
              </Badge>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400">
              Connect your Stripe account to process payments, manage customers, and view payment analytics.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Publishable Key
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                    {maskKey('pk_live_51S4YDzPylkOEYCeleUYF2vcuGCVgTps9t3y1hb4Qn5jY7vBgMGrDBSj2hEw6mnC355A9HPaG9l6EPtMMjBB4Zbxe00PiDwxo9c')}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowKeys(!showKeys)}
                  >
                    {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Webhook URL
                </label>
                <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono break-all">
                  {window.location.origin}/webhooks/stripe
                </code>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Stripe Dashboard
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Payment Processing',
                'Customer Management',
                'Invoice Generation',
                'Subscription Management',
                'Refund Processing',
                'Webhook Integration',
                'Multi-currency Support',
                'Fraud Protection'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Stripe Integration
            </CardTitle>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                Connected
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh Data
            </Button>
            <Button variant="outline" asChild>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Stripe Dashboard
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Customers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {customers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(payments.reduce((sum, payment) => sum + (payment.amount || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Payments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {payments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'succeeded').length / payments.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customers
            </CardTitle>
            <Button
              onClick={() => setShowCreateCustomer(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Customers
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first customer to start processing payments.
              </p>
              <Button onClick={() => setShowCreateCustomer(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.slice(0, 10).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {customer.name || customer.email}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      customer.delinquent 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    }>
                      {customer.delinquent ? 'Delinquent' : 'Active'}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onCreatePaymentIntent(10000, customer.id)} // $100.00
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      Charge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Payments
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                No payments have been processed yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 10).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(payment.amount)}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {payment.description || 'Payment'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      payment.status === 'succeeded' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }>
                      {payment.status}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {new Date(payment.created * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Customer Modal */}
      {showCreateCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Create New Customer
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email *
                </label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Customer Name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreateCustomer}
                disabled={!newCustomerEmail}
                className="flex-1"
              >
                Create Customer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateCustomer(false)
                  setNewCustomerEmail('')
                  setNewCustomerName('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

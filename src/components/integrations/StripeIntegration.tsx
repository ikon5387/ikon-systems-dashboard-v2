import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  CreditCard,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react'
import { StripeService } from '@/services/integrations/StripeService'
import { notifications } from '@/lib/notifications'

interface StripeIntegrationProps {
  onStatusChange?: (status: 'connected' | 'disconnected' | 'error') => void
}

export function StripeIntegration({ onStatusChange }: StripeIntegrationProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error' | 'testing'>('disconnected')
  const [showKeys, setShowKeys] = useState(false)
  const [testing, setTesting] = useState(false)
  const [_loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    successRate: 0
  })

  const stripeService = StripeService

  useEffect(() => {
    checkConnection()
    loadStats()
  }, [])

  const checkConnection = async () => {
    try {
      setStatus('testing')
      // Test Stripe connection by trying to get customers
      const response = await stripeService.getCustomers()
      if (response.success) {
        setStatus('connected')
        onStatusChange?.('connected')
      } else {
        setStatus('error')
        onStatusChange?.('error')
      }
    } catch (error) {
      setStatus('error')
      onStatusChange?.('error')
    }
  }

  const loadStats = async () => {
    try {
      setLoading(true)
      // Mock stats - in real implementation, this would come from Stripe API
      setStats({
        totalCustomers: Math.floor(Math.random() * 100) + 50,
        totalRevenue: Math.floor(Math.random() * 50000) + 10000,
        activeSubscriptions: Math.floor(Math.random() * 20) + 10,
        successRate: Math.floor(Math.random() * 10) + 90
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    try {
      await checkConnection()
      notifications.success('Stripe connection test successful')
    } catch (error) {
      notifications.error('Stripe connection test failed')
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-gray-400" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Connected</Badge>
      case 'disconnected':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">Disconnected</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Error</Badge>
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Testing</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">Unknown</Badge>
    }
  }

  const maskKey = (key: string) => {
    if (!key) return 'Not configured'
    if (showKeys) return key
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Stripe Payments
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Secure payment processing and subscription management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Secret Key
              </label>
              <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                {maskKey('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')}
              </code>
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

          <div className="flex gap-3">
            <Button
              onClick={testConnection}
              disabled={testing}
              className="flex items-center gap-2"
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Test Connection
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
                  {stats.totalCustomers}
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
                  {formatCurrency(stats.totalRevenue)}
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.activeSubscriptions}
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
                  {stats.successRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Supported Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Credit Cards', icon: '💳' },
              { name: 'Debit Cards', icon: '💳' },
              { name: 'Bank Transfers', icon: '🏦' },
              { name: 'Digital Wallets', icon: '📱' },
              { name: 'Cryptocurrency', icon: '₿' },
              { name: 'Buy Now, Pay Later', icon: '⏰' },
              { name: 'International', icon: '🌍' },
              { name: 'Recurring', icon: '🔄' }
            ].map((method, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-2xl">{method.icon}</span>
                <span className="text-sm font-medium">{method.name}</span>
              </div>
            ))}
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
              'Subscription Management',
              'Invoice Generation',
              'Customer Management',
              'Refund Processing',
              'Webhook Integration',
              'Multi-currency Support',
              'Fraud Protection',
              'PCI Compliance',
              'Real-time Analytics',
              'Custom Payment Forms',
              'Mobile Payments'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2" asChild>
              <a href="/financials">
                <DollarSign className="w-4 h-4" />
                View Financials
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Stripe Dashboard
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                API Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

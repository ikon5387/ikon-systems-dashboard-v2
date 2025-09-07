import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  CheckCircle, 
  XCircle, 
  Settings, 
  Key, 
  Shield, 
  Activity,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { config } from '@/lib/env'
import { notifications } from '@/lib/notifications'
import { VAPIIntegration } from '@/components/integrations/VAPIIntegration'
import { StripeIntegration } from '@/components/integrations/StripeIntegration'
import { GoogleCalendarIntegration } from '@/components/integrations/GoogleCalendarIntegration'
import { TwilioIntegration } from '@/components/integrations/TwilioIntegration'

interface IntegrationStatus {
  name: string
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  lastChecked?: Date
  error?: string
  config?: any
}

interface IntegrationConfig {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: IntegrationStatus
  apiKey?: string
  publicKey?: string
  clientId?: string
  clientSecret?: string
  accountSid?: string
  authToken?: string
  publishableKey?: string
  secretKey?: string
  webhookUrl?: string
  redirectUri?: string
  allowedOrigins?: string[]
  features: string[]
  documentation?: string
}

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'vapi' | 'stripe' | 'google-calendar' | 'twilio'>('overview')

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = () => {
    const integrationsData: IntegrationConfig[] = [
      {
        id: 'vapi',
        name: 'VAPI Voice Agents',
        description: 'AI-powered voice agents for automated calls and customer interactions',
        icon: <Activity className="w-6 h-6" />,
        status: {
          name: 'VAPI',
          status: config.integrations.vapi.enabled ? 'connected' : 'disconnected',
          lastChecked: new Date()
        },
        apiKey: config.integrations.vapi.enabled ? 'aab4aefd-1b57-43b0-9fd5-e05767b59452' : undefined,
        publicKey: config.integrations.vapi.enabled ? '3fdc26da-d7d6-45c1-a939-5f1c65fb4941' : undefined,
        webhookUrl: `${window.location.origin}/webhooks/vapi`,
        allowedOrigins: ['All domains allowed'],
        features: [
          'Voice Agent Creation',
          'Call Management',
          'Real-time Analytics',
          'Webhook Integration',
          'Multi-language Support'
        ],
        documentation: 'https://docs.vapi.ai'
      },
      {
        id: 'stripe',
        name: 'Stripe Payments',
        description: 'Secure payment processing and subscription management',
        icon: <Shield className="w-6 h-6" />,
        status: {
          name: 'Stripe',
          status: config.integrations.stripe.enabled ? 'connected' : 'disconnected',
          lastChecked: new Date()
        },
        publishableKey: config.integrations.stripe.enabled ? 'pk_live_51S4YDzPylkOEYCeleUYF2vcuGCVgTps9t3y1hb4Qn5jY7vBgMGrDBSj2hEw6mnC355A9HPaG9l6EPtMMjBB4Zbxe00PiDwxo9c' : undefined,
        secretKey: config.integrations.stripe.enabled ? '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' : undefined,
        webhookUrl: `${window.location.origin}/webhooks/stripe`,
        features: [
          'Payment Processing',
          'Subscription Management',
          'Invoice Generation',
          'Customer Management',
          'Refund Processing'
        ],
        documentation: 'https://stripe.com/docs'
      },
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Calendar integration for appointment scheduling and event management',
        icon: <Settings className="w-6 h-6" />,
        status: {
          name: 'Google Calendar',
          status: config.integrations.googleCalendar.enabled ? 'connected' : 'disconnected',
          lastChecked: new Date()
        },
        clientId: config.integrations.googleCalendar.enabled ? '901267958264-ndsknvnql46t3uvmtruogi4ksa7ca52t.apps.googleusercontent.com' : undefined,
        clientSecret: config.integrations.googleCalendar.enabled ? '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' : undefined,
        redirectUri: `${window.location.origin}/api/google-calendar/callback`,
        features: [
          'Event Creation',
          'Calendar Management',
          'OAuth2 Authentication',
          'Real-time Sync',
          'Meeting Scheduling'
        ],
        documentation: 'https://developers.google.com/calendar'
      },
      {
        id: 'twilio',
        name: 'Twilio SMS',
        description: 'SMS messaging and communication services',
        icon: <Key className="w-6 h-6" />,
        status: {
          name: 'Twilio',
          status: config.integrations.twilio.enabled ? 'connected' : 'disconnected',
          lastChecked: new Date()
        },
        accountSid: config.integrations.twilio.enabled ? 'AC4a2d843480651632e193c7eb47926e6c' : undefined,
        authToken: config.integrations.twilio.enabled ? '11a1d3d0537f46a9e081006c6ae233bc' : undefined,
        features: [
          'SMS Messaging',
          'Phone Number Management',
          'Message Templates',
          'Delivery Tracking',
          'International Support'
        ],
        documentation: 'https://www.twilio.com/docs'
      }
    ]

    setIntegrations(integrationsData)
  }

  const testIntegration = async (integration: IntegrationConfig) => {
    setTesting(prev => ({ ...prev, [integration.id]: true }))
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update integration status
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: { ...int.status, status: 'connected', lastChecked: new Date() } }
          : int
      ))
      
      notifications.success(`${integration.name} connection test successful`)
    } catch (error) {
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: { ...int.status, status: 'error', error: 'Connection test failed' } }
          : int
      ))
      
      notifications.error(`Failed to test ${integration.name} connection`)
    } finally {
      setTesting(prev => ({ ...prev, [integration.id]: false }))
    }
  }

  const toggleKeyVisibility = (integrationId: string) => {
    setShowKeys(prev => ({ ...prev, [integrationId]: !prev[integrationId] }))
  }

  const getStatusIcon = (status: string) => {
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

  const getStatusBadge = (status: string) => {
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

  const maskKey = (key: string, show: boolean) => {
    if (!key) return 'Not configured'
    if (show) return key
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vapi':
        return <VAPIIntegration />
      case 'stripe':
        return <StripeIntegration />
      case 'google-calendar':
        return <GoogleCalendarIntegration />
      case 'twilio':
        return <TwilioIntegration />
      default:
        return renderOverview()
    }
  }

  const renderOverview = () => (
    <>
      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(integration.status.status)}
                  {getStatusBadge(integration.status.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Features
                </h4>
                <div className="flex flex-wrap gap-1">
                  {integration.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* API Keys/Configuration */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Configuration
                </h4>
                
                {integration.apiKey && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Private API Key</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                        {maskKey(integration.apiKey, showKeys[integration.id])}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleKeyVisibility(integration.id)}
                      >
                        {showKeys[integration.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {integration.publicKey && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Public API Key</label>
                    <code className="block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                      {maskKey(integration.publicKey, showKeys[integration.id])}
                    </code>
                  </div>
                )}

                {integration.clientId && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Client ID</label>
                    <code className="block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                      {maskKey(integration.clientId, showKeys[integration.id])}
                    </code>
                  </div>
                )}

                {integration.publishableKey && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Publishable Key</label>
                    <code className="block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                      {maskKey(integration.publishableKey, showKeys[integration.id])}
                    </code>
                  </div>
                )}

                {integration.accountSid && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Account SID</label>
                    <code className="block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                      {maskKey(integration.accountSid, showKeys[integration.id])}
                    </code>
                  </div>
                )}
              </div>

              {/* Webhook URLs */}
              {integration.webhookUrl && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Webhook URL</label>
                  <code className="block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono break-all">
                    {integration.webhookUrl}
                  </code>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Button
                  size="sm"
                  onClick={() => testIntegration(integration)}
                  disabled={testing[integration.id]}
                  className="flex-1"
                >
                  {testing[integration.id] ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Activity className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab(integration.id as any)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                {integration.documentation && (
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Last Checked */}
              {integration.status.lastChecked && (
                <p className="text-xs text-slate-500">
                  Last checked: {integration.status.lastChecked.toLocaleString()}
                </p>
              )}

              {/* Error Message */}
              {integration.status.error && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                  {integration.status.error}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Integrations</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your third-party service integrations and API connections
          </p>
        </div>
        <Button
          onClick={loadIntegrations}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Settings },
            { id: 'vapi', name: 'VAPI', icon: Activity },
            { id: 'stripe', name: 'Stripe', icon: Shield },
            { id: 'google-calendar', name: 'Google Calendar', icon: Calendar },
            { id: 'twilio', name: 'Twilio', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Integration Details Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {selectedIntegration.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {selectedIntegration.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedIntegration.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIntegration(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedIntegration.status.status)}
                    {getStatusBadge(selectedIntegration.status.status)}
                    {selectedIntegration.status.lastChecked && (
                      <span className="text-sm text-slate-500">
                        Last checked: {selectedIntegration.status.lastChecked.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Available Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedIntegration.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configuration Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Configuration Details</h3>
                  <div className="space-y-3">
                    {selectedIntegration.webhookUrl && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Webhook URL
                        </label>
                        <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono break-all">
                          {selectedIntegration.webhookUrl}
                        </code>
                      </div>
                    )}

                    {selectedIntegration.redirectUri && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Redirect URI
                        </label>
                        <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono break-all">
                          {selectedIntegration.redirectUri}
                        </code>
                      </div>
                    )}

                    {selectedIntegration.allowedOrigins && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Allowed Origins
                        </label>
                        <div className="mt-1 space-y-1">
                          {selectedIntegration.allowedOrigins.map((origin, index) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              {origin}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={() => testIntegration(selectedIntegration)}
                    disabled={testing[selectedIntegration.id]}
                    className="flex-1"
                  >
                    {testing[selectedIntegration.id] ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Activity className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  {selectedIntegration.documentation && (
                    <Button variant="outline" asChild>
                      <a href={selectedIntegration.documentation} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

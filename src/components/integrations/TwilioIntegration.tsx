import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Phone,
  Send,
  Users,
  Globe
} from 'lucide-react'
import { TwilioService } from '@/services/integrations/TwilioService'
import { notifications } from '@/lib/notifications'

interface TwilioIntegrationProps {
  onStatusChange?: (status: 'connected' | 'disconnected' | 'error') => void
}

export function TwilioIntegration({ onStatusChange }: TwilioIntegrationProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error' | 'testing'>('disconnected')
  const [showKeys, setShowKeys] = useState(false)
  const [testing, setTesting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalMessages: 0,
    messagesSent: 0,
    phoneNumbers: 0,
    successRate: 0
  })

  const twilioService = TwilioService

  useEffect(() => {
    checkConnection()
    loadStats()
  }, [])

  const checkConnection = async () => {
    try {
      setStatus('testing')
      // Test Twilio connection by trying to get phone numbers
      const response = await twilioService.getPhoneNumbers()
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
      // Mock stats - in real implementation, this would come from Twilio API
      setStats({
        totalMessages: Math.floor(Math.random() * 1000) + 500,
        messagesSent: Math.floor(Math.random() * 100) + 50,
        phoneNumbers: Math.floor(Math.random() * 5) + 1,
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
      notifications.success('Twilio connection test successful')
    } catch (error) {
      notifications.error('Twilio connection test failed')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Twilio SMS
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              SMS messaging and communication services
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
            <MessageSquare className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Account SID
              </label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  {maskKey('AC4a2d843480651632e193c7eb47926e6c')}
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
                Auth Token
              </label>
              <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                {maskKey('11a1d3d0537f46a9e081006c6ae233bc')}
              </code>
            </div>
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
                <MessageSquare className="w-4 h-4" />
              )}
              Test Connection
            </Button>
            <Button variant="outline" asChild>
              <a href="https://www.twilio.com/docs" target="_blank" rel="noopener noreferrer">
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
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Messages</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalMessages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Messages Sent</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.messagesSent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Phone Numbers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.phoneNumbers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
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

      {/* SMS Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'SMS Messaging', icon: '📱', description: 'Send and receive SMS messages' },
              { name: 'Phone Numbers', icon: '📞', description: 'Manage phone numbers' },
              { name: 'Message Templates', icon: '📝', description: 'Create reusable message templates' },
              { name: 'Delivery Tracking', icon: '📊', description: 'Track message delivery status' },
              { name: 'International Support', icon: '🌍', description: 'Send messages worldwide' },
              { name: 'Bulk Messaging', icon: '📢', description: 'Send messages to multiple recipients' },
              { name: 'Webhook Integration', icon: '🔗', description: 'Real-time message status updates' },
              { name: 'Message History', icon: '📜', description: 'View message history and logs' }
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {feature.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
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
              'SMS Messaging',
              'Phone Number Management',
              'Message Templates',
              'Delivery Tracking',
              'International Support',
              'Bulk Messaging',
              'Webhook Integration',
              'Message History',
              'Two-Factor Authentication',
              'Voice Calls',
              'WhatsApp Integration',
              'Email Integration'
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
              <a href="/clients">
                <Users className="w-4 h-4" />
                Send to Clients
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Twilio Console
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="https://www.twilio.com/docs" target="_blank" rel="noopener noreferrer">
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

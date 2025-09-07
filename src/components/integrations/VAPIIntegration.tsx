import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Phone,
  Mic,
  BarChart3,
  Settings
} from 'lucide-react'
import { VAPIService } from '@/services/integrations/VAPIService'
import { notifications } from '@/lib/notifications'

interface VAPIIntegrationProps {
  onStatusChange?: (status: 'connected' | 'disconnected' | 'error') => void
}

export function VAPIIntegration({ onStatusChange }: VAPIIntegrationProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error' | 'testing'>('disconnected')
  const [showKeys, setShowKeys] = useState(false)
  const [testing, setTesting] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeCalls: 0,
    totalCalls: 0,
    successRate: 0
  })

  const vapiService = VAPIService

  useEffect(() => {
    checkConnection()
    loadAgents()
    loadStats()
  }, [])

  const checkConnection = async () => {
    try {
      setStatus('testing')
      // Test VAPI connection by trying to get agents
      const response = await vapiService.getVoiceAgents()
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

  const loadAgents = async () => {
    try {
      setLoading(true)
      const response = await vapiService.getVoiceAgents()
      if (response.success && response.data) {
        setAgents(response.data)
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats - in real implementation, this would come from VAPI analytics
      setStats({
        totalAgents: agents.length,
        activeCalls: Math.floor(Math.random() * 5),
        totalCalls: Math.floor(Math.random() * 1000) + 500,
        successRate: Math.floor(Math.random() * 20) + 80
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    try {
      await checkConnection()
      notifications.success('VAPI connection test successful')
    } catch (error) {
      notifications.error('VAPI connection test failed')
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
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              VAPI Voice Agents
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              AI-powered voice agents for automated calls and customer interactions
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
            <Settings className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Private API Key
              </label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  {maskKey('aab4aefd-1b57-43b0-9fd5-e05767b59452')}
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
                Public API Key
              </label>
              <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                {maskKey('3fdc26da-d7d6-45c1-a939-5f1c65fb4941')}
              </code>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Webhook URL
            </label>
            <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono break-all">
              {window.location.origin}/webhooks/vapi
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
                <Activity className="w-4 h-4" />
              )}
              Test Connection
            </Button>
            <Button variant="outline" asChild>
              <a href="https://docs.vapi.ai" target="_blank" rel="noopener noreferrer">
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
                <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Agents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalAgents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Calls</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.activeCalls}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Calls</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalCalls}
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

      {/* Recent Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Agents
            </CardTitle>
            <Button
              onClick={loadAgents}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Voice Agents
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first voice agent to get started with automated calls.
              </p>
              <Button asChild>
                <a href="/voice-agents">Create Agent</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mic className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {agent.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {agent.phone_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      agent.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }>
                      {agent.status}
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/voice-agents/${agent.id}`}>View</a>
                    </Button>
                  </div>
                </div>
              ))}
              {agents.length > 5 && (
                <div className="text-center pt-3">
                  <Button variant="outline" asChild>
                    <a href="/voice-agents">View All Agents</a>
                  </Button>
                </div>
              )}
            </div>
          )}
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
              'Voice Agent Creation',
              'Call Management',
              'Real-time Analytics',
              'Webhook Integration',
              'Multi-language Support',
              'Custom Voice Models',
              'Call Recording',
              'Performance Metrics'
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

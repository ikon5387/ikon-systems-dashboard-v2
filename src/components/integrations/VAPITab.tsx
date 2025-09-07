import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Mic,
  Phone,
  BarChart3,
  Eye,
  EyeOff,
  Plus,
  Play
} from 'lucide-react'

interface VAPITabProps {
  connected: boolean
  agents: any[]
  calls: any[]
  loading: boolean
  onRefresh: () => void
  onCreateAgent: (agentData: any) => void
  onMakeCall: (agentId: string, phoneNumber: string) => void
}

export function VAPITab({ 
  connected, 
  agents, 
  calls, 
  loading, 
  onRefresh,
  onMakeCall
}: VAPITabProps) {
  const [showKeys, setShowKeys] = useState(false)
  const [_showCreateAgent, setShowCreateAgent] = useState(false)
  const [testCallNumber, setTestCallNumber] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')

  const maskKey = (key: string) => {
    if (!key) return 'Not configured'
    if (showKeys) return key
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4)
  }

  const handleMakeCall = async () => {
    if (!selectedAgent || !testCallNumber) return
    
    await onMakeCall(selectedAgent, testCallNumber)
    setTestCallNumber('')
    setSelectedAgent('')
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              VAPI Integration
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
              Connect your VAPI account to create voice agents, make calls, and track call analytics.
            </p>

            <div className="space-y-3">
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

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Webhook URL
                </label>
                <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono break-all">
                  {window.location.origin}/webhooks/vapi
                </code>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <a href="https://dashboard.vapi.ai" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open VAPI Dashboard
                </a>
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

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              VAPI Integration
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
              <a href="https://dashboard.vapi.ai" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                VAPI Dashboard
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
                  {agents.length}
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Calls</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {calls.length}
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {calls.length > 0 ? Math.round((calls.filter(c => c.status === 'completed').length / calls.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Agents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {agents.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Call Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Quick Call Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} - {agent.phone_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={testCallNumber}
                onChange={(e) => setTestCallNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+1234567890"
              />
            </div>
          </div>
          <Button
            onClick={handleMakeCall}
            disabled={!selectedAgent || !testCallNumber}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Make Test Call
          </Button>
        </CardContent>
      </Card>

      {/* VAPI Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              VAPI Agents
            </CardTitle>
            <Button
              onClick={() => setShowCreateAgent(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Agent
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
                No VAPI Agents
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first VAPI agent to start making automated calls.
              </p>
              <Button onClick={() => setShowCreateAgent(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.slice(0, 10).map((agent) => (
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedAgent(agent.id)
                        setTestCallNumber('')
                      }}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Calls
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                No calls have been made yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.slice(0, 10).map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {call.phoneNumber}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Duration: {call.duration || 0}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      call.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : call.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }>
                      {call.status}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {new Date(call.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

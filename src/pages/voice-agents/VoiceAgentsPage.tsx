import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiMic,
  FiPhone,
  FiPlay,
  FiPause,
  FiMoreVertical,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiVolume2,
  FiMessageSquare,
  FiRefreshCw,
  FiExternalLink,
  FiSettings,
  FiBarChart3,
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { VoiceAgentForm } from '@/components/forms/VoiceAgentForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useVoiceAgents, useCreateVoiceAgent, useUpdateVoiceAgent, useDeleteVoiceAgent, useUpdateVoiceAgentStatus, useMakeCall } from '@/hooks/useVoiceAgents'
import { useAuth } from '@/hooks/useAuth'
import { VAPIService } from '@/services/integrations/VAPIService'
import { VAPITab } from '@/components/integrations/VAPITab'
import { notifications } from '@/lib/notifications'
import type { VoiceAgent } from '@/services/voice-agents/VoiceAgentService'

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    icon: FiCheckCircle
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    icon: FiPause
  },
  training: {
    label: 'Training',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    icon: FiActivity
  },
  error: {
    label: 'Error',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: FiXCircle
  }
}

const typeConfig = {
  sales: { label: 'Sales', icon: '💰', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
  support: { label: 'Support', icon: '🛠️', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
  appointment: { label: 'Appointment', icon: '📅', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
  follow_up: { label: 'Follow-up', icon: '🔄', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
  custom: { label: 'Custom', icon: '⚙️', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' }
}

export function VoiceAgentsPage() {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showAgentForm, setShowAgentForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<VoiceAgent | null>(null)
  const [deletingAgent, setDeletingAgent] = useState<VoiceAgent | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [testCallNumber, setTestCallNumber] = useState('')
  
  // VAPI integration state
  const [vapiConnected, setVapiConnected] = useState(false)
  const [vapiAgents, setVapiAgents] = useState<any[]>([])
  const [vapiCalls, setVapiCalls] = useState<any[]>([])
  const [loadingVapi, setLoadingVapi] = useState(false)
  const [activeTab, setActiveTab] = useState<'agents' | 'vapi'>('agents')

  const { data: agents, isLoading, error } = useVoiceAgents()
  const createAgentMutation = useCreateVoiceAgent()
  const updateAgentMutation = useUpdateVoiceAgent()
  const deleteAgentMutation = useDeleteVoiceAgent()
  const updateStatusMutation = useUpdateVoiceAgentStatus()
  const makeCallMutation = useMakeCall()

  const vapiService = VAPIService

  // Check VAPI connection on component mount
  useEffect(() => {
    checkVapiConnection()
  }, [])

  const checkVapiConnection = async () => {
    try {
      const response = await vapiService.getVoiceAgents()
      setVapiConnected(response.success)
      if (response.success) {
        loadVapiData()
      }
    } catch (error) {
      console.error('Failed to check VAPI connection:', error)
    }
  }

  const loadVapiData = async () => {
    try {
      setLoadingVapi(true)
      const [agentsResponse, callsResponse] = await Promise.all([
        vapiService.getVoiceAgents(),
        vapiService.getCallHistory('', 20)
      ])
      
      if (agentsResponse.success && agentsResponse.data) {
        setVapiAgents(agentsResponse.data)
      }
      
      if (callsResponse.success && callsResponse.data) {
        setVapiCalls(callsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load VAPI data:', error)
      notifications.error('Failed to load VAPI data')
    } finally {
      setLoadingVapi(false)
    }
  }

  const createVapiAgent = async (agentData: any) => {
    try {
      const response = await vapiService.createVoiceAgent(agentData)
      if (response.success) {
        notifications.success('VAPI agent created successfully')
        loadVapiData() // Refresh data
        return response.data
      } else {
        notifications.error('Failed to create VAPI agent')
      }
    } catch (error) {
      notifications.error('Failed to create VAPI agent')
    }
  }

  const makeVapiCall = async (agentId: string, phoneNumber: string) => {
    try {
      const response = await vapiService.makeCall(agentId, phoneNumber)
      if (response.success) {
        notifications.success('Call initiated successfully')
        loadVapiData() // Refresh data
        return response.data
      } else {
        notifications.error('Failed to initiate call')
      }
    } catch (error) {
      notifications.error('Failed to initiate call')
    }
  }

  // Filter and search agents
  const filteredAgents = useMemo(() => {
    if (!agents) return []

    return agents.filter(agent => {
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
      const matchesType = typeFilter === 'all' || agent.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [agents, searchQuery, statusFilter, typeFilter])

  const handleCreateAgent = async (data: any) => {
    try {
      await createAgentMutation.mutateAsync(data)
      setShowAgentForm(false)
    } catch (error) {
      console.error('Failed to create voice agent:', error)
    }
  }

  const handleUpdateAgent = async (data: any) => {
    if (!editingAgent) return

    try {
      await updateAgentMutation.mutateAsync({
        id: editingAgent.id,
        ...data
      })
      setEditingAgent(null)
    } catch (error) {
      console.error('Failed to update voice agent:', error)
    }
  }

  const handleDeleteAgent = async () => {
    if (!deletingAgent) return

    try {
      await deleteAgentMutation.mutateAsync(deletingAgent.id)
      setDeletingAgent(null)
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Failed to delete voice agent:', error)
    }
  }

  const handleToggleStatus = async (agent: VoiceAgent) => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active'
    try {
      await updateStatusMutation.mutateAsync({
        id: agent.id,
        status: newStatus
      })
    } catch (error) {
      console.error('Failed to update agent status:', error)
    }
  }

  const handleTestCall = async (agent: VoiceAgent) => {
    if (!testCallNumber.trim()) {
      alert('Please enter a phone number for the test call')
      return
    }

    try {
      await makeCallMutation.mutateAsync({
        agentId: agent.id,
        phoneNumber: testCallNumber
      })
    } catch (error) {
      console.error('Failed to make test call:', error)
    }
  }

  const openDeleteDialog = (agent: VoiceAgent) => {
    setDeletingAgent(agent)
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
            Please sign in to view voice agents.
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
        <LoadingSpinner size="lg" text="Loading voice agents..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Voice Agents
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {error.message || 'Failed to load voice agents. Please try again.'}
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
          <h1 className="text-3xl font-bold gradient-text">Voice Agents</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your AI voice agents powered by Vapi
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button
            onClick={() => setShowAgentForm(true)}
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 button-glow hover-lift"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
          {vapiConnected && (
            <Button
              onClick={loadVapiData}
              variant="outline"
              disabled={loadingVapi}
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loadingVapi ? 'animate-spin' : ''}`} />
              Sync VAPI
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'agents'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FiMic className="w-4 h-4" />
            Voice Agents
          </button>
          <button
            onClick={() => setActiveTab('vapi')}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vapi'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FiActivity className="w-4 h-4" />
            VAPI
            {vapiConnected ? (
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
      {activeTab === 'agents' && (
        <>
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search agents by name or description..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="training">Training</option>
                <option value="error">Error</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="appointment">Appointment</option>
                <option value="follow_up">Follow-up</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FiMic className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 'No agents found' : 'No voice agents created'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first AI voice agent.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
              <Button
                onClick={() => setShowAgentForm(true)}
                className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Create Your First Agent
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const statusInfo = statusConfig[agent.status]
            const typeInfo = typeConfig[agent.type]
            const StatusIcon = statusInfo.icon

            return (
              <Card key={agent.id} className="card-hover group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                        {agent.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${statusInfo.color} text-xs font-medium flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                        <Badge className={`${typeInfo.color} text-xs font-medium`}>
                          {typeInfo.icon} {typeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Description */}
                  {agent.description && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p className="line-clamp-2">{agent.description}</p>
                    </div>
                  )}

                  {/* Configuration */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FiMessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{agent.model} • {agent.voice}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FiVolume2 className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{agent.language?.toUpperCase() || 'EN'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FiClock className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Max {agent.max_duration || 300}s</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {(agent as any).total_calls || 0}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Total Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {(agent as any).conversion_rate ? `${(agent as any).conversion_rate}%` : '0%'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Conversion</div>
                    </div>
                  </div>

                  {/* Test Call */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Test phone number"
                        value={testCallNumber}
                        onChange={(e) => setTestCallNumber(e.target.value)}
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleTestCall(agent)}
                        disabled={makeCallMutation.isPending || agent.status !== 'active'}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <FiPhone className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingAgent(agent)}
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
                      <Link to={`/voice-agents/${agent.id}`}>
                        <FiEye className="w-3 h-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(agent)}
                      disabled={updateStatusMutation.isPending}
                      className={agent.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {agent.status === 'active' ? (
                        <FiPause className="w-3 h-3" />
                      ) : (
                        <FiPlay className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      onClick={() => openDeleteDialog(agent)}
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
        </>
      )}

      {activeTab === 'vapi' && (
        <VAPITab 
          connected={vapiConnected}
          agents={vapiAgents}
          calls={vapiCalls}
          loading={loadingVapi}
          onRefresh={loadVapiData}
          onCreateAgent={createVapiAgent}
          onMakeCall={makeVapiCall}
        />
      )}

      {/* Agent Form Modal */}
      {showAgentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <VoiceAgentForm
              voiceAgent={null}
              onSave={handleCreateAgent}
              onCancel={() => setShowAgentForm(false)}
              isLoading={createAgentMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <VoiceAgentForm
              voiceAgent={editingAgent}
              onSave={handleUpdateAgent}
              onCancel={() => setEditingAgent(null)}
              isLoading={updateAgentMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteAgent}
        title="Delete Voice Agent"
        message={`Are you sure you want to delete "${deletingAgent?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

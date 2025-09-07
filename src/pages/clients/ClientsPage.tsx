import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiMail,
  FiPhone,
  FiMapPin,
  FiMoreVertical,
  FiUser,
  FiCalendar,
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ClientForm } from '@/components/forms/ClientForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import type { Client } from '@/services/clients/ClientService'
import { useRealtimeClients } from '@/hooks/useRealtime'
import { useQueryClient } from '@tanstack/react-query'

const statusColors = {
  lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  prospect: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  churned: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
}

const statusLabels = {
  lead: 'Lead',
  prospect: 'Prospect',
  active: 'Active',
  churned: 'Churned'
}

export function ClientsPage() {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const queryClient = useQueryClient()

  const { data: clients, isLoading, error } = useClients()
  const createClientMutation = useCreateClient()
  const updateClientMutation = useUpdateClient()
  const deleteClientMutation = useDeleteClient()

  // Real-time updates for clients
  useRealtimeClients((payload) => {
    console.log('Real-time client update in clients page:', payload)
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    queryClient.invalidateQueries({ queryKey: ['clientStats'] })
  })

  // Filter and search clients
  const filteredClients = useMemo(() => {
    if (!clients) return []

    return clients.filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || client.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [clients, searchQuery, statusFilter])

  const handleCreateClient = async (data: any) => {
    try {
      await createClientMutation.mutateAsync(data)
      setShowClientForm(false)
    } catch (error) {
      console.error('Failed to create client:', error)
    }
  }

  const handleUpdateClient = async (data: any) => {
    if (!editingClient) return

    try {
      await updateClientMutation.mutateAsync({
        id: editingClient.id,
        ...data
      })
      setEditingClient(null)
    } catch (error) {
      console.error('Failed to update client:', error)
    }
  }

  const handleDeleteClient = async () => {
    if (!deletingClient) return

    try {
      await deleteClientMutation.mutateAsync(deletingClient.id)
      setDeletingClient(null)
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Failed to delete client:', error)
    }
  }

  const openDeleteDialog = (client: Client) => {
    setDeletingClient(client)
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
            Please sign in to view clients.
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
        <LoadingSpinner size="lg" text="Loading clients..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Clients
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {error.message || 'Failed to load clients. Please try again.'}
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
          <h1 className="text-3xl font-bold gradient-text">Clients</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your client relationships and track their progress
          </p>
        </div>
        <Button
          onClick={() => setShowClientForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 button-glow hover-lift"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search clients by name, email, or phone..."
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
                <option value="lead">Leads</option>
                <option value="prospect">Prospects</option>
                <option value="active">Active</option>
                <option value="churned">Churned</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FiUser className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first client.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button
                onClick={() => setShowClientForm(true)}
                className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="card-hover group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                      {client.name}
                    </CardTitle>
                    <div className="flex items-center mt-1">
                      <Badge 
                        className={`${statusColors[client.status]} text-xs font-medium`}
                      >
                        {statusLabels[client.status]}
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
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <FiMail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FiPhone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <FiMapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {client.notes && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="line-clamp-2">{client.notes}</p>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  <span>Added {formatDate(client.created_at)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingClient(client)}
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
                    <Link to={`/clients/${client.id}`}>
                      <FiEye className="w-3 h-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    onClick={() => openDeleteDialog(client)}
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ClientForm
              client={null}
              onSave={handleCreateClient}
              onCancel={() => setShowClientForm(false)}
              isLoading={createClientMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ClientForm
              client={editingClient}
              onSave={handleUpdateClient}
              onCancel={() => setEditingClient(null)}
              isLoading={updateClientMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        message={`Are you sure you want to delete ${deletingClient?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

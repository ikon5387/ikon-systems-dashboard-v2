import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import type { AppointmentWithClient } from '@/services/appointments/AppointmentService'

const statusConfig = {
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    icon: FiCalendar
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    icon: FiCheckCircle
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
    icon: FiCheckCircle
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: FiXCircle
  },
  no_show: {
    label: 'No Show',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: FiXCircle
  }
}

const typeConfig = {
  demo: { label: 'Demo', icon: '🎯', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
  call: { label: 'Call', icon: '📞', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
  meeting: { label: 'Meeting', icon: '🤝', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
  follow_up: { label: 'Follow-up', icon: '🔄', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
  consultation: { label: 'Consultation', icon: '💡', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300' }
}

export function AppointmentsPage() {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithClient | null>(null)
  const [deletingAppointment, setDeletingAppointment] = useState<AppointmentWithClient | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: appointments, isLoading, error } = useAppointments()
  const createAppointmentMutation = useCreateAppointment()
  const updateAppointmentMutation = useUpdateAppointment()
  const deleteAppointmentMutation = useDeleteAppointment()

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    if (!appointments) return []

    return appointments.filter(appointment => {
      const matchesSearch = 
        (appointment.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appointment.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.client?.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
      const matchesType = typeFilter === 'all' || appointment.type === typeFilter

      let matchesDate = true
      if (dateFilter !== 'all') {
        const appointmentDate = new Date(appointment.date_time)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

        switch (dateFilter) {
          case 'today':
            matchesDate = appointmentDate >= today && appointmentDate < tomorrow
            break
          case 'tomorrow':
            matchesDate = appointmentDate >= tomorrow && appointmentDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
            break
          case 'this_week':
            matchesDate = appointmentDate >= today && appointmentDate < weekEnd
            break
          case 'overdue':
            matchesDate = appointmentDate < now && appointment.status !== 'completed' && appointment.status !== 'cancelled'
            break
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate
    })
  }, [appointments, searchQuery, statusFilter, typeFilter, dateFilter])

  const handleCreateAppointment = async (data: any) => {
    try {
      await createAppointmentMutation.mutateAsync(data)
      setShowAppointmentForm(false)
    } catch (error) {
      console.error('Failed to create appointment:', error)
    }
  }

  const handleUpdateAppointment = async (data: any) => {
    if (!editingAppointment) return

    try {
      await updateAppointmentMutation.mutateAsync({
        id: editingAppointment.id,
        ...data
      })
      setEditingAppointment(null)
    } catch (error) {
      console.error('Failed to update appointment:', error)
    }
  }

  const handleDeleteAppointment = async () => {
    if (!deletingAppointment) return

    try {
      await deleteAppointmentMutation.mutateAsync(deletingAppointment.id)
      setDeletingAppointment(null)
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Failed to delete appointment:', error)
    }
  }


  const openDeleteDialog = (appointment: AppointmentWithClient) => {
    setDeletingAppointment(appointment)
    setShowConfirmDialog(true)
  }

  const isOverdue = (scheduledAt: string) => {
    return new Date(scheduledAt) < new Date()
  }

  const isToday = (scheduledAt: string) => {
    const appointmentDate = new Date(scheduledAt)
    const today = new Date()
    return appointmentDate.toDateString() === today.toDateString()
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please sign in to view appointments.
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
        <LoadingSpinner size="lg" text="Loading appointments..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Appointments
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {error.message || 'Failed to load appointments. Please try again.'}
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
          <h1 className="text-3xl font-bold gradient-text">Appointments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your schedule and client meetings
          </p>
        </div>
        <Button
          onClick={() => setShowAppointmentForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 button-glow hover-lift"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search appointments by title, description, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="demo">Demo</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="follow_up">Follow-up</option>
                <option value="consultation">Consultation</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This Week</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FiCalendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all' ? 'No appointments found' : 'No appointments scheduled'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by scheduling your first appointment.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && dateFilter === 'all' && (
              <Button
                onClick={() => setShowAppointmentForm(true)}
                className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Schedule Your First Appointment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig]
            const typeInfo = typeConfig[appointment.type]
            const StatusIcon = statusInfo.icon
            const overdue = isOverdue(appointment.date_time)
            const today = isToday(appointment.date_time)

            return (
              <Card key={appointment.id} className="card-hover group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                          {appointment.title || 'Untitled Appointment'}
                        </h3>
                        <Badge className={`${statusInfo.color} text-xs font-medium flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                        <Badge className={`${typeInfo.color} text-xs font-medium`}>
                          {typeInfo.icon} {typeInfo.label}
                        </Badge>
                        {overdue && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-xs font-medium">
                            Overdue
                          </Badge>
                        )}
                        {today && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-medium">
                            Today
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <FiUser className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{appointment.client?.name || 'No client assigned'}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <FiCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(appointment.date_time)}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <FiClock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatDate(appointment.date_time)} (60 min)</span>
                        </div>
                      </div>


                      {appointment.notes && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-4">
                          <p className="line-clamp-2">{appointment.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAppointment(appointment)}
                          >
                            <FiEdit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/appointments/${appointment.id}`}>
                              <FiEye className="w-3 h-3 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            onClick={() => openDeleteDialog(appointment)}
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AppointmentForm
              appointment={null}
              onSave={handleCreateAppointment}
              onCancel={() => setShowAppointmentForm(false)}
              isLoading={createAppointmentMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AppointmentForm
              appointment={editingAppointment}
              onSave={handleUpdateAppointment}
              onCancel={() => setEditingAppointment(null)}
              isLoading={updateAppointmentMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteAppointment}
        title="Delete Appointment"
        message={`Are you sure you want to delete this appointment? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

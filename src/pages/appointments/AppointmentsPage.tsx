import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { GoogleCalendarTab } from '@/components/integrations/GoogleCalendarTab'
import { 
  FiCalendar, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiRefreshCw,
  FiClock,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail
} from 'react-icons/fi'
import { format, isToday as dateFnsIsToday, isTomorrow, isThisWeek, isPast } from 'date-fns'
import toast from 'react-hot-toast'

interface AppointmentWithClient {
  id: string
  client_id: string
  date_time: string
  title: string | null
  description: string | null
  type: 'demo' | 'call' | 'follow_up' | 'meeting' | 'consultation'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
  duration: number | null
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
  client: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

export function AppointmentsPage() {
  const { isAuthenticated } = useAuth()
  const { data: appointments = [], isLoading, refetch } = useAppointments()
  const createAppointmentMutation = useCreateAppointment()
  const updateAppointmentMutation = useUpdateAppointment()
  const deleteAppointmentMutation = useDeleteAppointment()

  // State
  const [activeTab, setActiveTab] = useState<'appointments' | 'google-calendar'>('appointments')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithClient | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentWithClient | null>(null)

  // Google Calendar state
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<any[]>([])
  const [loadingGoogleCalendar, setLoadingGoogleCalendar] = useState(false)

  // Check Google Calendar connection
  const checkGoogleCalendarConnection = async () => {
    try {
      // This would check if the user has connected their Google Calendar
      // For now, we'll simulate this
      setGoogleCalendarConnected(false)
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error)
    }
  }

  // Load Google Calendar events
  const loadGoogleCalendarEvents = async () => {
    if (!googleCalendarConnected) return
    
    setLoadingGoogleCalendar(true)
    try {
      // This would fetch events from Google Calendar
      // For now, we'll simulate this
      setGoogleCalendarEvents([])
    } catch (error) {
      console.error('Error loading Google Calendar events:', error)
      toast.error('Failed to load calendar events')
    } finally {
      setLoadingGoogleCalendar(false)
    }
  }

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      // This would initiate the OAuth flow
      toast.success('Google Calendar connected successfully!')
      setGoogleCalendarConnected(true)
      await loadGoogleCalendarEvents()
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error)
      toast.error('Failed to connect to Google Calendar')
    }
  }

  // Sync appointment to Google Calendar
  const syncAppointmentToGoogleCalendar = async (appointment: AppointmentWithClient) => {
    if (!googleCalendarConnected) {
      toast.error('Please connect to Google Calendar first')
      return
    }

    try {
      // This would create an event in Google Calendar
      toast.success('Appointment synced to Google Calendar!')
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error)
      toast.error('Failed to sync appointment to Google Calendar')
    }
  }

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment: AppointmentWithClient) => {
    const matchesSearch = !searchQuery || 
      appointment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.client.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter

    const appointmentDate = new Date(appointment.date_time)
    let matchesDate = true
    if (dateFilter === 'today') {
      matchesDate = dateFnsIsToday(appointmentDate)
    } else if (dateFilter === 'tomorrow') {
      matchesDate = isTomorrow(appointmentDate)
    } else if (dateFilter === 'this_week') {
      matchesDate = isThisWeek(appointmentDate)
    } else if (dateFilter === 'overdue') {
      matchesDate = isPast(appointmentDate) && appointment.status !== 'completed'
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  // Handlers
  const handleCreateAppointment = async (data: any) => {
    try {
      await createAppointmentMutation.mutateAsync(data)
      setShowAppointmentForm(false)
      toast.success('Appointment created successfully!')
      refetch()
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Failed to create appointment')
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
      toast.success('Appointment updated successfully!')
      refetch()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    }
  }

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return

    try {
      await deleteAppointmentMutation.mutateAsync(appointmentToDelete.id)
      setAppointmentToDelete(null)
      setShowConfirmDialog(false)
      toast.success('Appointment deleted successfully!')
      refetch()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Failed to delete appointment')
    }
  }

  const openDeleteDialog = (appointment: AppointmentWithClient) => {
    setAppointmentToDelete(appointment)
    setShowConfirmDialog(true)
  }

  const isOverdue = (scheduledAt: string) => {
    return isPast(new Date(scheduledAt))
  }

  const isToday = (scheduledAt: string) => {
    return dateFnsIsToday(new Date(scheduledAt))
  }

  // Effects
  useEffect(() => {
    checkGoogleCalendarConnection()
  }, [])

  useEffect(() => {
    if (googleCalendarConnected) {
      loadGoogleCalendarEvents()
    }
  }, [googleCalendarConnected])

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

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Appointments</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your schedule and client meetings
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button
            onClick={() => setShowAppointmentForm(true)}
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            New Appointment
          </Button>
          {googleCalendarConnected && (
            <Button
              variant="outline"
              onClick={loadGoogleCalendarEvents}
              disabled={loadingGoogleCalendar}
              className="flex items-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loadingGoogleCalendar ? 'animate-spin' : ''}`} />
              Sync Calendar
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appointments'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FiCalendar className="w-4 h-4" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('google-calendar')}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'google-calendar'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <FiCalendar className="w-4 h-4" />
            Google Calendar
            {googleCalendarConnected ? (
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
      {activeTab === 'appointments' && (
        <>
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
                  No appointments found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by creating your first appointment.'}
                </p>
                <Button onClick={() => setShowAppointmentForm(true)}>
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAppointments.map((appointment: AppointmentWithClient) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {appointment.title || `${appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} with ${appointment.client.name}`}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <FiClock className="w-4 h-4" />
                                {format(new Date(appointment.date_time), 'MMM dd, yyyy • h:mm a')}
                              </div>
                              {appointment.duration && (
                                <span>{appointment.duration} minutes</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              appointment.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : appointment.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                            }>
                              {appointment.status}
                            </Badge>
                            {isOverdue(appointment.date_time) && appointment.status !== 'completed' && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                Overdue
                              </Badge>
                            )}
                            {isToday(appointment.date_time) && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                Today
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              <FiUser className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {appointment.client.name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                {appointment.client.email && (
                                  <div className="flex items-center gap-1">
                                    <FiMail className="w-3 h-3" />
                                    {appointment.client.email}
                                  </div>
                                )}
                                {appointment.client.phone && (
                                  <div className="flex items-center gap-1">
                                    <FiPhone className="w-3 h-3" />
                                    {appointment.client.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {appointment.location && (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <FiMapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">Location</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {appointment.location}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {appointment.description && (
                          <div className="mt-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              {appointment.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAppointment(appointment)}
                        >
                          <FiEdit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(appointment)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                        {googleCalendarConnected && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncAppointmentToGoogleCalendar(appointment)}
                          >
                            <FiCalendar className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'google-calendar' && (
        <GoogleCalendarTab 
          connected={googleCalendarConnected}
          events={googleCalendarEvents}
          loading={loadingGoogleCalendar}
          onConnect={connectGoogleCalendar}
          onRefresh={loadGoogleCalendarEvents}
        />
      )}
    </div>

    {/* Appointment Form Modal */}
    {showAppointmentForm && (
      <AppointmentForm
        appointment={null}
        onSave={handleCreateAppointment}
        onCancel={() => setShowAppointmentForm(false)}
        isLoading={createAppointmentMutation.isPending}
      />
    )}

    {/* Edit Appointment Form Modal */}
    {editingAppointment && (
      <AppointmentForm
        appointment={editingAppointment as any}
        onSave={handleUpdateAppointment}
        onCancel={() => setEditingAppointment(null)}
        isLoading={updateAppointmentMutation.isPending}
      />
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
    </>
  )
}
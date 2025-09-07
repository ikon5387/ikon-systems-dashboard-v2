import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  Users,
  MapPin,
  Bell
} from 'lucide-react'
import { GoogleCalendarService } from '@/services/integrations/GoogleCalendarService'
import { notifications } from '@/lib/notifications'

interface GoogleCalendarIntegrationProps {
  onStatusChange?: (status: 'connected' | 'disconnected' | 'error') => void
}

export function GoogleCalendarIntegration({ onStatusChange }: GoogleCalendarIntegrationProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error' | 'testing'>('disconnected')
  const [showKeys, setShowKeys] = useState(false)
  const [testing, setTesting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    calendars: 0,
    lastSync: new Date()
  })

  const googleCalendarService = GoogleCalendarService

  useEffect(() => {
    checkConnection()
    loadStats()
  }, [])

  const checkConnection = async () => {
    try {
      setStatus('testing')
      const isAuth = await googleCalendarService.isAuthenticated()
      if (isAuth) {
        setStatus('connected')
        setAuthenticated(true)
        onStatusChange?.('connected')
      } else {
        setStatus('disconnected')
        setAuthenticated(false)
        onStatusChange?.('disconnected')
      }
    } catch (error) {
      setStatus('error')
      onStatusChange?.('error')
    }
  }

  const loadStats = async () => {
    try {
      setLoading(true)
      // Mock stats - in real implementation, this would come from Google Calendar API
      setStats({
        totalEvents: Math.floor(Math.random() * 500) + 100,
        upcomingEvents: Math.floor(Math.random() * 20) + 5,
        calendars: Math.floor(Math.random() * 5) + 1,
        lastSync: new Date()
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
      if (authenticated) {
        notifications.success('Google Calendar connection test successful')
      } else {
        notifications.info('Google Calendar not authenticated. Please connect your account.')
      }
    } catch (error) {
      notifications.error('Google Calendar connection test failed')
    } finally {
      setTesting(false)
    }
  }

  const handleConnect = async () => {
    try {
      const response = await googleCalendarService.getAuthUrl()
      if (response.success && response.data) {
        window.open(response.data.authUrl, '_blank')
        notifications.success('Please complete authentication in the popup window')
      } else {
        notifications.error('Failed to get authentication URL')
      }
    } catch (error) {
      notifications.error('Failed to initiate Google Calendar connection')
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
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Google Calendar
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Calendar integration for appointment scheduling and event management
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
            <Calendar className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Client ID
              </label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  {maskKey('901267958264-ndsknvnql46t3uvmtruogi4ksa7ca52t.apps.googleusercontent.com')}
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
                Client Secret
              </label>
              <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                {maskKey('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')}
              </code>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Redirect URI
            </label>
            <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono break-all">
              {window.location.origin}/api/google-calendar/callback
            </code>
          </div>

          <div className="flex gap-3">
            {!authenticated ? (
              <Button
                onClick={handleConnect}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Connect Google Calendar
              </Button>
            ) : (
              <Button
                onClick={testConnection}
                disabled={testing}
                className="flex items-center gap-2"
              >
                {testing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                Test Connection
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href="https://developers.google.com/calendar" target="_blank" rel="noopener noreferrer">
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
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Upcoming Events</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.upcomingEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Calendars</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.calendars}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Last Sync</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {stats.lastSync.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Event Creation', icon: '📅', description: 'Create and manage calendar events' },
              { name: 'Meeting Scheduling', icon: '🤝', description: 'Schedule meetings with clients' },
              { name: 'Reminder System', icon: '🔔', description: 'Set up automatic reminders' },
              { name: 'Location Integration', icon: '📍', description: 'Add locations to events' },
              { name: 'Attendee Management', icon: '👥', description: 'Invite and manage attendees' },
              { name: 'Recurring Events', icon: '🔄', description: 'Create recurring appointments' },
              { name: 'Time Zone Support', icon: '🌍', description: 'Handle multiple time zones' },
              { name: 'Calendar Sync', icon: '🔄', description: 'Real-time synchronization' }
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
              'Event Creation',
              'Calendar Management',
              'OAuth2 Authentication',
              'Real-time Sync',
              'Meeting Scheduling',
              'Reminder System',
              'Attendee Management',
              'Location Integration',
              'Recurring Events',
              'Time Zone Support',
              'Calendar Sharing',
              'Event Templates'
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
              <a href="/appointments">
                <Calendar className="w-4 h-4" />
                View Appointments
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Google Calendar
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="https://developers.google.com/calendar" target="_blank" rel="noopener noreferrer">
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

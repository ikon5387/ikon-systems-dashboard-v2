import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Clock,
  MapPin,
  Users,
  Eye,
  EyeOff
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface GoogleCalendarTabProps {
  connected: boolean
  events: any[]
  loading: boolean
  onConnect: () => void
  onRefresh: () => void
}

export function GoogleCalendarTab({ 
  connected, 
  events, 
  loading, 
  onConnect, 
  onRefresh 
}: GoogleCalendarTabProps) {
  const [showKeys, setShowKeys] = React.useState(false)

  const maskKey = (key: string) => {
    if (!key) return 'Not configured'
    if (showKeys) return key
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4)
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Google Calendar Integration
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
              Connect your Google Calendar to sync appointments and view your calendar events directly in the dashboard.
            </p>

            <div className="space-y-3">
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
                  Redirect URI
                </label>
                <code className="block mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono break-all">
                  {window.location.origin}/api/google-calendar/callback
                </code>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={onConnect} className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Connect Google Calendar
              </Button>
              <Button variant="outline" asChild>
                <a href="https://developers.google.com/calendar" target="_blank" rel="noopener noreferrer">
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
                'Event Creation',
                'Calendar Management',
                'OAuth2 Authentication',
                'Real-time Sync',
                'Meeting Scheduling',
                'Reminder System',
                'Attendee Management',
                'Location Integration'
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
              <Calendar className="w-5 h-5" />
              Google Calendar Integration
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
              Refresh Events
            </Button>
            <Button variant="outline" asChild>
              <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Google Calendar
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Upcoming Events
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                No events found in your Google Calendar for the next 7 days.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {event.summary || 'Untitled Event'}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(event.start?.dateTime || event.start?.date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {events.length}
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
                <p className="text-sm text-slate-600 dark:text-slate-400">This Week</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {events.filter(event => {
                    const eventDate = new Date(event.start?.dateTime || event.start?.date)
                    const now = new Date()
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                    return eventDate >= now && eventDate <= weekFromNow
                  }).length}
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
                <p className="text-sm text-slate-600 dark:text-slate-400">With Attendees</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {events.filter(event => event.attendees && event.attendees.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

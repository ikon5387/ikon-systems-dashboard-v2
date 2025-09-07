import { supabase } from '@/lib/supabase'
import { notifications } from '@/lib/notifications'

// Types
export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  }>
  location?: string
  conferenceData?: {
    createRequest?: {
      requestId: string
      conferenceSolutionKey: {
        type: 'hangoutsMeet' | 'eventHangout' | 'eventNamedHangout'
      }
    }
  }
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  metadata?: Record<string, any>
}

export interface CreateEventData {
  summary: string
  description?: string
  startDateTime: string
  endDateTime: string
  timeZone?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  location?: string
  createMeeting?: boolean
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  metadata?: Record<string, any>
}

export interface UpdateEventData {
  summary?: string
  description?: string
  startDateTime?: string
  endDateTime?: string
  timeZone?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  location?: string
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  metadata?: Record<string, any>
}

export interface CalendarListResponse {
  items: Array<{
    id: string
    summary: string
    description?: string
    primary?: boolean
    accessRole: 'owner' | 'reader' | 'writer' | 'freeBusyReader'
    backgroundColor?: string
    foregroundColor?: string
  }>
}

export interface EventListResponse {
  items: CalendarEvent[]
  nextPageToken?: string
}

export interface GoogleCalendarResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

class GoogleCalendarServiceClass {
  private baseUrl: string
  private isEnabled: boolean = false

  constructor() {
    this.baseUrl = '/api/google-calendar'
    this.isEnabled = this.checkIfEnabled()
  }

  private checkIfEnabled(): boolean {
    // Check if Google Calendar is enabled in environment
    return !!process.env.VITE_GOOGLE_CALENDAR_ENABLED
  }

  private async makeBackendRequest<T>(
    endpoint: string,
    data: any = {},
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<GoogleCalendarResponse<T>> {
    if (!this.isEnabled) {
      return {
        data: null,
        error: 'Google Calendar integration is not enabled',
        success: false
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return {
          data: null,
          error: 'Authentication required',
          success: false
        }
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Request failed')
      }

      return {
        data: result.data,
        error: null,
        success: true
      }
    } catch (error) {
      console.error('Google Calendar API error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      return {
        data: null,
        error: errorMessage,
        success: false
      }
    }
  }

  // Authentication methods
  async getAuthUrl(): Promise<GoogleCalendarResponse<{ authUrl: string }>> {
    const response = await this.makeBackendRequest<{ authUrl: string }>('/auth-url', {}, 'GET')
    return response
  }

  async exchangeCodeForToken(code: string): Promise<GoogleCalendarResponse<AuthTokens>> {
    const response = await this.makeBackendRequest<AuthTokens>('/callback', { code })
    
    if (response.success) {
      notifications.success('Google Calendar connected successfully')
    }
    
    return response
  }

  async refreshAccessToken(): Promise<GoogleCalendarResponse<AuthTokens>> {
    const response = await this.makeBackendRequest<AuthTokens>('/refresh-token', {})
    return response
  }

  async revokeAccess(): Promise<GoogleCalendarResponse<{ success: boolean }>> {
    const response = await this.makeBackendRequest<{ success: boolean }>('/revoke', {})
    
    if (response.success) {
      notifications.success('Google Calendar access revoked')
    }
    
    return response
  }

  // Calendar methods
  async getCalendars(): Promise<GoogleCalendarResponse<CalendarListResponse>> {
    const response = await this.makeBackendRequest<CalendarListResponse>('/calendars', {}, 'GET')
    return response
  }

  async getPrimaryCalendar(): Promise<GoogleCalendarResponse<CalendarListResponse>> {
    const response = await this.makeBackendRequest<CalendarListResponse>('/calendars/primary', {}, 'GET')
    return response
  }

  // Event methods
  async createEvent(eventData: CreateEventData): Promise<GoogleCalendarResponse<CalendarEvent>> {
    const response = await this.makeBackendRequest<CalendarEvent>('/events', eventData)
    
    if (response.success) {
      notifications.success('Event created successfully')
    }
    
    return response
  }

  async updateEvent(eventId: string, eventData: UpdateEventData): Promise<GoogleCalendarResponse<CalendarEvent>> {
    const response = await this.makeBackendRequest<CalendarEvent>(`/events/${eventId}`, eventData, 'PUT')
    
    if (response.success) {
      notifications.success('Event updated successfully')
    }
    
    return response
  }

  async deleteEvent(eventId: string): Promise<GoogleCalendarResponse<{ success: boolean }>> {
    const response = await this.makeBackendRequest<{ success: boolean }>(`/events/${eventId}`, {}, 'DELETE')
    
    if (response.success) {
      notifications.success('Event deleted successfully')
    }
    
    return response
  }

  async getEvent(eventId: string): Promise<GoogleCalendarResponse<CalendarEvent>> {
    const response = await this.makeBackendRequest<CalendarEvent>(`/events/${eventId}`, {}, 'GET')
    return response
  }

  async getEvents(
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 10
  ): Promise<GoogleCalendarResponse<EventListResponse>> {
    const params = new URLSearchParams({
      calendarId,
      maxResults: maxResults.toString()
    })
    
    if (timeMin) params.append('timeMin', timeMin)
    if (timeMax) params.append('timeMax', timeMax)
    
    const response = await this.makeBackendRequest<EventListResponse>(`/events?${params}`, {}, 'GET')
    return response
  }

  async getUpcomingEvents(calendarId: string = 'primary', maxResults: number = 10): Promise<GoogleCalendarResponse<EventListResponse>> {
    const now = new Date().toISOString()
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    
    return this.getEvents(calendarId, now, oneWeekFromNow, maxResults)
  }

  async getTodayEvents(calendarId: string = 'primary'): Promise<GoogleCalendarResponse<EventListResponse>> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
    
    return this.getEvents(calendarId, startOfDay, endOfDay, 50)
  }

  // Business-specific methods
  async createAppointmentEvent(
    clientEmail: string,
    clientName: string,
    appointmentDate: Date,
    duration: number = 60,
    description?: string,
    location?: string
  ): Promise<GoogleCalendarResponse<CalendarEvent>> {
    const startDateTime = appointmentDate.toISOString()
    const endDateTime = new Date(appointmentDate.getTime() + duration * 60000).toISOString()
    
    const eventData: CreateEventData = {
      summary: `Appointment with ${clientName}`,
      description: description || `Appointment with ${clientName}`,
      startDateTime,
      endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      attendees: [{
        email: clientEmail,
        displayName: clientName
      }],
      location,
      createMeeting: true,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 15 } // 15 minutes before
        ]
      },
      metadata: {
        type: 'appointment',
        client: clientName,
        duration: duration
      }
    }

    return this.createEvent(eventData)
  }

  async createProjectMeetingEvent(
    projectName: string,
    attendees: Array<{ email: string, name: string }>,
    meetingDate: Date,
    duration: number = 60,
    description?: string,
    location?: string
  ): Promise<GoogleCalendarResponse<CalendarEvent>> {
    const startDateTime = meetingDate.toISOString()
    const endDateTime = new Date(meetingDate.getTime() + duration * 60000).toISOString()
    
    const eventData: CreateEventData = {
      summary: `${projectName} - Project Meeting`,
      description: description || `Project meeting for ${projectName}`,
      startDateTime,
      endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      attendees: attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name
      })),
      location,
      createMeeting: true,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 }, // 1 hour before
          { method: 'popup', minutes: 15 } // 15 minutes before
        ]
      },
      metadata: {
        type: 'project_meeting',
        project: projectName,
        duration: duration
      }
    }

    return this.createEvent(eventData)
  }

  async createFollowUpEvent(
    clientName: string,
    followUpDate: Date,
    description: string,
    duration: number = 30
  ): Promise<GoogleCalendarResponse<CalendarEvent>> {
    const startDateTime = followUpDate.toISOString()
    const endDateTime = new Date(followUpDate.getTime() + duration * 60000).toISOString()
    
    const eventData: CreateEventData = {
      summary: `Follow-up: ${clientName}`,
      description,
      startDateTime,
      endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 } // 30 minutes before
        ]
      },
      metadata: {
        type: 'follow_up',
        client: clientName,
        duration: duration
      }
    }

    return this.createEvent(eventData)
  }

  // Utility methods
  formatDateTime(date: Date, timeZone?: string): string {
    return date.toISOString()
  }

  parseDateTime(dateTimeString: string): Date {
    return new Date(dateTimeString)
  }

  getTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.getCalendars()
      return response.success
    } catch {
      return false
    }
  }

  // Get connection status
  get isServiceEnabled(): boolean {
    return this.isEnabled
  }
}

export const GoogleCalendarService = new GoogleCalendarServiceClass()

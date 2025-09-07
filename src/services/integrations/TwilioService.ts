import { config } from '@/lib/env'
import { notifications } from '@/lib/notifications'

export interface SMSMessage {
  id: string
  to: string
  from: string
  body: string
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'delivered' | 'undelivered'
  timestamp: string
  errorCode?: string
  errorMessage?: string
}

export interface SendSMSData {
  to: string
  message: string
  from?: string
}

export interface PhoneNumber {
  id: string
  phoneNumber: string
  friendlyName: string
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
  }
  status: string
  region: string
  countryCode: string
}

export interface TwilioResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

class TwilioServiceClass {
  private readonly accountSid: string | undefined
  private readonly authToken: string | undefined
  private readonly baseUrl: string
  private readonly enabled: boolean

  constructor() {
    this.accountSid = config.integrations.twilio.accountSid
    this.authToken = config.integrations.twilio.authToken
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`
    this.enabled = config.integrations.twilio.enabled
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TwilioResponse<T>> {
    if (!this.enabled || !this.accountSid || !this.authToken) {
      return {
        data: null,
        error: 'Twilio integration is not configured',
        success: false
      }
    }

    try {
      const credentials = btoa(`${this.accountSid}:${this.authToken}`)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        data,
        error: null,
        success: true
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      notifications.error(`Twilio Error: ${errorMessage}`)
      return {
        data: null,
        error: errorMessage,
        success: false
      }
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '')
    
    // Add +1 if it's a US number without country code
    if (digits.length === 10) {
      return `+1${digits}`
    }
    
    // Add + if it doesn't start with it
    if (!digits.startsWith('+')) {
      return `+${digits}`
    }
    
    return digits
  }

  async sendSMS(smsData: SendSMSData): Promise<TwilioResponse<SMSMessage>> {
    const formattedTo = this.formatPhoneNumber(smsData.to)
    const fromNumber = smsData.from || await this.getDefaultPhoneNumber()

    if (!fromNumber) {
      return {
        data: null,
        error: 'No Twilio phone number available',
        success: false
      }
    }

    const params = new URLSearchParams({
      To: formattedTo,
      From: fromNumber,
      Body: smsData.message
    })

    const response = await this.makeRequest<any>('/Messages.json', {
      method: 'POST',
      body: params.toString()
    })

    if (response.success && response.data) {
      const smsMessage: SMSMessage = {
        id: response.data.sid,
        to: response.data.to,
        from: response.data.from,
        body: response.data.body,
        status: response.data.status,
        timestamp: response.data.date_created,
        errorCode: response.data.error_code,
        errorMessage: response.data.error_message
      }

      notifications.success(`SMS sent to ${formattedTo}`)
      return {
        data: smsMessage,
        error: null,
        success: true
      }
    }

    return response
  }

  async getSMSMessages(limit: number = 50): Promise<TwilioResponse<SMSMessage[]>> {
    const response = await this.makeRequest<any>(`/Messages.json?PageSize=${limit}`)

    if (response.success && response.data?.messages) {
      const messages: SMSMessage[] = response.data.messages.map((msg: any) => ({
        id: msg.sid,
        to: msg.to,
        from: msg.from,
        body: msg.body,
        status: msg.status,
        timestamp: msg.date_created,
        errorCode: msg.error_code,
        errorMessage: msg.error_message
      }))

      return {
        data: messages,
        error: null,
        success: true
      }
    }

    return response
  }

  async getSMSMessage(messageId: string): Promise<TwilioResponse<SMSMessage>> {
    const response = await this.makeRequest<any>(`/Messages/${messageId}.json`)

    if (response.success && response.data) {
      const smsMessage: SMSMessage = {
        id: response.data.sid,
        to: response.data.to,
        from: response.data.from,
        body: response.data.body,
        status: response.data.status,
        timestamp: response.data.date_created,
        errorCode: response.data.error_code,
        errorMessage: response.data.error_message
      }

      return {
        data: smsMessage,
        error: null,
        success: true
      }
    }

    return response
  }

  async getPhoneNumbers(): Promise<TwilioResponse<PhoneNumber[]>> {
    const response = await this.makeRequest<any>('/IncomingPhoneNumbers.json')

    if (response.success && response.data?.incoming_phone_numbers) {
      const phoneNumbers: PhoneNumber[] = response.data.incoming_phone_numbers.map((phone: any) => ({
        phoneNumber: phone.phone_number,
        friendlyName: phone.friendly_name,
        capabilities: {
          voice: phone.capabilities.voice,
          sms: phone.capabilities.sms,
          mms: phone.capabilities.mms
        }
      }))

      return {
        data: phoneNumbers,
        error: null,
        success: true
      }
    }

    return response
  }

  private async getDefaultPhoneNumber(): Promise<string | null> {
    const phoneNumbersResponse = await this.getPhoneNumbers()
    
    if (phoneNumbersResponse.success && phoneNumbersResponse.data && phoneNumbersResponse.data.length > 0) {
      // Return the first SMS-capable phone number
      const smsCapableNumber = phoneNumbersResponse.data.find(phone => phone.capabilities.sms)
      return smsCapableNumber?.phoneNumber || phoneNumbersResponse.data[0].phoneNumber
    }

    return null
  }

  async sendBulkSMS(recipients: string[], message: string): Promise<TwilioResponse<SMSMessage[]>> {
    const results: SMSMessage[] = []
    const errors: string[] = []

    for (const recipient of recipients) {
      const result = await this.sendSMS({ to: recipient, message })
      
      if (result.success && result.data) {
        results.push(result.data)
      } else {
        errors.push(`Failed to send to ${recipient}: ${result.error}`)
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('; ')
      notifications.warning(`Some messages failed to send: ${errorMessage}`)
      
      return {
        data: results,
        error: errorMessage,
        success: results.length > 0
      }
    }

    notifications.success(`Successfully sent ${results.length} messages`)
    return {
      data: results,
      error: null,
      success: true
    }
  }

  async sendAppointmentReminder(
    phoneNumber: string, 
    clientName: string, 
    appointmentDate: string,
    appointmentTime: string
  ): Promise<TwilioResponse<SMSMessage>> {
    const message = `Hi ${clientName}! This is a reminder about your appointment with Ikon Systems on ${appointmentDate} at ${appointmentTime}. Please reply CONFIRM to confirm or RESCHEDULE if you need to change the time. Thank you!`

    return this.sendSMS({
      to: phoneNumber,
      message
    })
  }

  async sendWelcomeMessage(phoneNumber: string, clientName: string): Promise<TwilioResponse<SMSMessage>> {
    const message = `Welcome to Ikon Systems, ${clientName}! We're excited to help you with your home remodeling project. Our team will be in touch soon to discuss your needs. For immediate assistance, call us at (555) 123-4567.`

    return this.sendSMS({
      to: phoneNumber,
      message
    })
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  get hasCredentials(): boolean {
    return !!this.accountSid && !!this.authToken
  }
}

export const TwilioService = new TwilioServiceClass()

// Integration Health and Stability Service
export interface IntegrationHealth {
  service: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  lastCheck: Date
  responseTime?: number
  errorRate?: number
  lastError?: string
  uptime: number
  version?: string
  features: {
    [key: string]: {
      available: boolean
      lastTested: Date
      error?: string
    }
  }
}

export interface IntegrationTest {
  id: string
  service: string
  testType: string
  status: 'pass' | 'fail' | 'warning'
  duration: number
  timestamp: Date
  error?: string
  details?: Record<string, any>
}

export interface IntegrationConfig {
  service: string
  enabled: boolean
  apiKey?: string
  webhookUrl?: string
  timeout: number
  retryAttempts: number
  healthCheckInterval: number
  features: string[]
}

class IntegrationHealthServiceClass {
  private healthStatuses: Map<string, IntegrationHealth> = new Map()
  private testResults: IntegrationTest[] = []
  private configs: Map<string, IntegrationConfig> = new Map()
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.initializeDefaultConfigs()
    this.startHealthChecks()
  }

  private initializeDefaultConfigs(): void {
    const defaultConfigs: IntegrationConfig[] = [
      {
        service: 'google-calendar',
        enabled: true,
        timeout: 5000,
        retryAttempts: 3,
        healthCheckInterval: 60000, // 1 minute
        features: ['auth', 'events', 'calendars']
      },
      {
        service: 'stripe',
        enabled: true,
        timeout: 5000,
        retryAttempts: 3,
        healthCheckInterval: 60000,
        features: ['payments', 'customers', 'invoices', 'webhooks']
      },
      {
        service: 'twilio',
        enabled: true,
        timeout: 5000,
        retryAttempts: 3,
        healthCheckInterval: 60000,
        features: ['sms', 'phone-numbers', 'webhooks']
      },
      {
        service: 'vapi',
        enabled: true,
        timeout: 10000,
        retryAttempts: 3,
        healthCheckInterval: 60000,
        features: ['agents', 'calls', 'webhooks']
      }
    ]

    defaultConfigs.forEach(config => {
      this.configs.set(config.service, config)
    })
  }

  // Health Check Management
  private startHealthChecks(): void {
    this.configs.forEach((config, service) => {
      if (config.enabled) {
        this.startHealthCheckForService(service)
      }
    })
  }

  private startHealthCheckForService(service: string): void {
    const config = this.configs.get(service)
    if (!config) return

    const interval = setInterval(async () => {
      await this.performHealthCheck(service)
    }, config.healthCheckInterval)

    this.healthCheckIntervals.set(service, interval)
  }

  async performHealthCheck(service: string): Promise<IntegrationHealth> {
    const config = this.configs.get(service)
    if (!config) {
      throw new Error(`No configuration found for service: ${service}`)
    }

    const startTime = Date.now()
    let health: IntegrationHealth

    try {
      switch (service) {
        case 'google-calendar':
          health = await this.checkGoogleCalendarHealth()
          break
        case 'stripe':
          health = await this.checkStripeHealth()
          break
        case 'twilio':
          health = await this.checkTwilioHealth()
          break
        case 'vapi':
          health = await this.checkVapiHealth()
          break
        default:
          throw new Error(`Unknown service: ${service}`)
      }

      health.responseTime = Date.now() - startTime
      health.lastCheck = new Date()

    } catch (error) {
      health = {
        service,
        status: 'down',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorRate: 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        uptime: 0,
        features: {}
      }
    }

    this.healthStatuses.set(service, health)
    return health
  }

  // Service-specific Health Checks
  private async checkGoogleCalendarHealth(): Promise<IntegrationHealth> {
    const features: IntegrationHealth['features'] = {}

    try {
      // Test authentication
      const authResponse = await this.makeRequest('/api/health/google-calendar/auth', {})
      features.auth = {
        available: authResponse.ok,
        lastTested: new Date(),
        error: authResponse.ok ? undefined : 'Authentication failed'
      }

      // Test calendar access
      const calendarResponse = await this.makeRequest('/api/health/google-calendar/calendars', {})
      features.calendars = {
        available: calendarResponse.ok,
        lastTested: new Date(),
        error: calendarResponse.ok ? undefined : 'Calendar access failed'
      }

      // Test event creation
      const eventResponse = await this.makeRequest('/api/health/google-calendar/events', {})
      features.events = {
        available: eventResponse.ok,
        lastTested: new Date(),
        error: eventResponse.ok ? undefined : 'Event operations failed'
      }

      const allHealthy = Object.values(features).every(f => f.available)
      
      return {
        service: 'google-calendar',
        status: allHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        uptime: this.calculateUptime('google-calendar'),
        features
      }

    } catch (error) {
      return {
        service: 'google-calendar',
        status: 'down',
        lastCheck: new Date(),
        lastError: error instanceof Error ? error.message : 'Unknown error',
        uptime: this.calculateUptime('google-calendar'),
        features
      }
    }
  }

  private async checkStripeHealth(): Promise<IntegrationHealth> {
    const features: IntegrationHealth['features'] = {}

    try {
      // Test API connectivity
      const apiResponse = await this.makeRequest('/api/health/stripe/api', {})
      features.payments = {
        available: apiResponse.ok,
        lastTested: new Date(),
        error: apiResponse.ok ? undefined : 'API connectivity failed'
      }

      // Test webhook endpoint
      const webhookResponse = await this.makeRequest('/api/health/stripe/webhooks', {})
      features.webhooks = {
        available: webhookResponse.ok,
        lastTested: new Date(),
        error: webhookResponse.ok ? undefined : 'Webhook endpoint failed'
      }

      // Test customer operations
      const customerResponse = await this.makeRequest('/api/health/stripe/customers', {})
      features.customers = {
        available: customerResponse.ok,
        lastTested: new Date(),
        error: customerResponse.ok ? undefined : 'Customer operations failed'
      }

      const allHealthy = Object.values(features).every(f => f.available)
      
      return {
        service: 'stripe',
        status: allHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        uptime: this.calculateUptime('stripe'),
        features
      }

    } catch (error) {
      return {
        service: 'stripe',
        status: 'down',
        lastCheck: new Date(),
        lastError: error instanceof Error ? error.message : 'Unknown error',
        uptime: this.calculateUptime('stripe'),
        features
      }
    }
  }

  private async checkTwilioHealth(): Promise<IntegrationHealth> {
    const features: IntegrationHealth['features'] = {}

    try {
      // Test SMS capability
      const smsResponse = await this.makeRequest('/api/health/twilio/sms', {})
      features.sms = {
        available: smsResponse.ok,
        lastTested: new Date(),
        error: smsResponse.ok ? undefined : 'SMS capability failed'
      }

      // Test phone number management
      const phoneResponse = await this.makeRequest('/api/health/twilio/phone-numbers', {})
      features['phone-numbers'] = {
        available: phoneResponse.ok,
        lastTested: new Date(),
        error: phoneResponse.ok ? undefined : 'Phone number management failed'
      }

      const allHealthy = Object.values(features).every(f => f.available)
      
      return {
        service: 'twilio',
        status: allHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        uptime: this.calculateUptime('twilio'),
        features
      }

    } catch (error) {
      return {
        service: 'twilio',
        status: 'down',
        lastCheck: new Date(),
        lastError: error instanceof Error ? error.message : 'Unknown error',
        uptime: this.calculateUptime('twilio'),
        features
      }
    }
  }

  private async checkVapiHealth(): Promise<IntegrationHealth> {
    const features: IntegrationHealth['features'] = {}

    try {
      // Test agent management
      const agentResponse = await this.makeRequest('/api/health/vapi/agents', {})
      features.agents = {
        available: agentResponse.ok,
        lastTested: new Date(),
        error: agentResponse.ok ? undefined : 'Agent management failed'
      }

      // Test call functionality
      const callResponse = await this.makeRequest('/api/health/vapi/calls', {})
      features.calls = {
        available: callResponse.ok,
        lastTested: new Date(),
        error: callResponse.ok ? undefined : 'Call functionality failed'
      }

      const allHealthy = Object.values(features).every(f => f.available)
      
      return {
        service: 'vapi',
        status: allHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        uptime: this.calculateUptime('vapi'),
        features
      }

    } catch (error) {
      return {
        service: 'vapi',
        status: 'down',
        lastCheck: new Date(),
        lastError: error instanceof Error ? error.message : 'Unknown error',
        uptime: this.calculateUptime('vapi'),
        features
      }
    }
  }

  // Integration Testing
  async runIntegrationTest(service: string, testType: string): Promise<IntegrationTest> {
    const startTime = Date.now()
    let test: IntegrationTest

    try {
      switch (service) {
        case 'google-calendar':
          test = await this.testGoogleCalendarIntegration(testType)
          break
        case 'stripe':
          test = await this.testStripeIntegration(testType)
          break
        case 'twilio':
          test = await this.testTwilioIntegration(testType)
          break
        case 'vapi':
          test = await this.testVapiIntegration(testType)
          break
        default:
          throw new Error(`Unknown service: ${service}`)
      }

      test.duration = Date.now() - startTime
      test.timestamp = new Date()

    } catch (error) {
      test = {
        id: this.generateId(),
        service,
        testType,
        status: 'fail',
        duration: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    this.testResults.push(test)
    return test
  }

  private async testGoogleCalendarIntegration(testType: string): Promise<IntegrationTest> {
    switch (testType) {
      case 'auth':
        const authResponse = await this.makeRequest('/api/test/google-calendar/auth')
        return {
          id: this.generateId(),
          service: 'google-calendar',
          testType: 'auth',
          status: authResponse.ok ? 'pass' : 'fail',
          duration: 0,
          timestamp: new Date(),
          error: authResponse.ok ? undefined : 'Authentication test failed'
        }
      
      case 'create-event':
        const eventResponse = await this.makeRequest('/api/test/google-calendar/create-event', {
          method: 'POST',
          body: JSON.stringify({
            summary: 'Test Event',
            start: { dateTime: new Date().toISOString() },
            end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
          })
        })
        return {
          id: this.generateId(),
          service: 'google-calendar',
          testType: 'create-event',
          status: eventResponse.ok ? 'pass' : 'fail',
          duration: 0,
          timestamp: new Date(),
          error: eventResponse.ok ? undefined : 'Event creation test failed'
        }
      
      default:
        throw new Error(`Unknown test type: ${testType}`)
    }
  }

  private async testStripeIntegration(testType: string): Promise<IntegrationTest> {
    switch (testType) {
      case 'create-customer':
        const customerResponse = await this.makeRequest('/api/test/stripe/create-customer', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            name: 'Test Customer'
          })
        })
        return {
          id: this.generateId(),
          service: 'stripe',
          testType: 'create-customer',
          status: customerResponse.ok ? 'pass' : 'fail',
          duration: 0,
          timestamp: new Date(),
          error: customerResponse.ok ? undefined : 'Customer creation test failed'
        }
      
      case 'create-payment-intent':
        const paymentResponse = await this.makeRequest('/api/test/stripe/create-payment-intent', {
          method: 'POST',
          body: JSON.stringify({
            amount: 1000,
            currency: 'usd'
          })
        })
        return {
          id: this.generateId(),
          service: 'stripe',
          testType: 'create-payment-intent',
          status: paymentResponse.ok ? 'pass' : 'fail',
          duration: 0,
          timestamp: new Date(),
          error: paymentResponse.ok ? undefined : 'Payment intent creation test failed'
        }
      
      default:
        throw new Error(`Unknown test type: ${testType}`)
    }
  }

  private async testTwilioIntegration(testType: string): Promise<IntegrationTest> {
    switch (testType) {
      case 'send-sms':
        const smsResponse = await this.makeRequest('/api/test/twilio/send-sms', {
          method: 'POST',
          body: JSON.stringify({
            to: '+1234567890',
            message: 'Test message'
          })
        })
        return {
          id: this.generateId(),
          service: 'twilio',
          testType: 'send-sms',
          status: smsResponse.ok ? 'pass' : 'fail',
          duration: 0,
          timestamp: new Date(),
          error: smsResponse.ok ? undefined : 'SMS sending test failed'
        }
      
      default:
        throw new Error(`Unknown test type: ${testType}`)
    }
  }

  private async testVapiIntegration(testType: string): Promise<IntegrationTest> {
    switch (testType) {
      case 'create-agent':
        const agentResponse = await this.makeRequest('/api/test/vapi/create-agent', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Test Agent',
            script: 'Hello, this is a test agent.'
          })
        })
        return {
          id: this.generateId(),
          service: 'vapi',
          testType: 'create-agent',
          status: agentResponse.ok ? 'pass' : 'fail',
          duration: 0,
          timestamp: new Date(),
          error: agentResponse.ok ? undefined : 'Agent creation test failed'
        }
      
      default:
        throw new Error(`Unknown test type: ${testType}`)
    }
  }

  // Configuration Management
  updateIntegrationConfig(service: string, config: Partial<IntegrationConfig>): void {
    const existingConfig = this.configs.get(service)
    if (existingConfig) {
      const updatedConfig = { ...existingConfig, ...config }
      this.configs.set(service, updatedConfig)
      
      // Restart health checks if interval changed
      if (config.healthCheckInterval && config.healthCheckInterval !== existingConfig.healthCheckInterval) {
        this.stopHealthCheckForService(service)
        this.startHealthCheckForService(service)
      }
    }
  }

  private stopHealthCheckForService(service: string): void {
    const interval = this.healthCheckIntervals.get(service)
    if (interval) {
      clearInterval(interval)
      this.healthCheckIntervals.delete(service)
    }
  }

  // Data Retrieval
  getAllHealthStatuses(): IntegrationHealth[] {
    return Array.from(this.healthStatuses.values())
  }

  getHealthStatus(service: string): IntegrationHealth | undefined {
    return this.healthStatuses.get(service)
  }

  getTestResults(service?: string, limit: number = 50): IntegrationTest[] {
    let results = this.testResults
    
    if (service) {
      results = results.filter(test => test.service === service)
    }
    
    return results
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  getIntegrationConfigs(): IntegrationConfig[] {
    return Array.from(this.configs.values())
  }

  // Utility Methods
  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    }

    return fetch(url, defaultOptions)
  }

  private calculateUptime(_service: string): number {
    // This would calculate actual uptime based on historical data
    // For now, return a mock value
    return Math.random() * 100
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Cleanup
  destroy(): void {
    this.healthCheckIntervals.forEach(interval => clearInterval(interval))
    this.healthCheckIntervals.clear()
  }
}

export const IntegrationHealthService = new IntegrationHealthServiceClass()

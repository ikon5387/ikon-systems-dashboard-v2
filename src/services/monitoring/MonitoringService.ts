// Monitoring and Error Logging Service
export interface ErrorLog {
  id: string
  timestamp: Date
  level: 'error' | 'warning' | 'info' | 'debug'
  message: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export interface SystemAlert {
  id: string
  timestamp: Date
  type: 'error' | 'performance' | 'security' | 'integration'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  source: string
  metadata?: Record<string, any>
  acknowledged: boolean
  acknowledgedAt?: Date
  acknowledgedBy?: string
}

export interface PerformanceMetric {
  id: string
  timestamp: Date
  metric: string
  value: number
  unit: string
  tags?: Record<string, string>
}

export interface IntegrationStatus {
  service: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  lastCheck: Date
  responseTime?: number
  errorRate?: number
  lastError?: string
}

class MonitoringServiceClass {
  private errorLogs: ErrorLog[] = []
  private alerts: SystemAlert[] = []
  private metrics: PerformanceMetric[] = []
  private integrationStatuses: Map<string, IntegrationStatus> = new Map()

  // Error Logging
  logError(error: Error, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      resolved: false
    }

    this.errorLogs.push(errorLog)
    this.checkForErrorThresholds()
    this.sendToExternalService(errorLog)
  }

  logWarning(message: string, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'warning',
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      resolved: false
    }

    this.errorLogs.push(errorLog)
  }

  logInfo(message: string, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'info',
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      resolved: false
    }

    this.errorLogs.push(errorLog)
  }

  // Alert Management
  createAlert(
    type: SystemAlert['type'],
    severity: SystemAlert['severity'],
    title: string,
    message: string,
    source: string,
    metadata?: Record<string, any>
  ): void {
    const alert: SystemAlert = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      severity,
      title,
      message,
      source,
      metadata,
      acknowledged: false
    }

    this.alerts.push(alert)
    this.notifyAlert(alert)
  }

  acknowledgeAlert(alertId: string, userId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedAt = new Date()
      alert.acknowledgedBy = userId
    }
  }

  // Performance Monitoring
  recordMetric(metric: string, value: number, unit: string, tags?: Record<string, string>): void {
    const performanceMetric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date(),
      metric,
      value,
      unit,
      tags
    }

    this.metrics.push(performanceMetric)
    this.checkPerformanceThresholds(performanceMetric)
  }

  // Integration Monitoring
  updateIntegrationStatus(service: string, status: IntegrationStatus): void {
    this.integrationStatuses.set(service, {
      ...status,
      lastCheck: new Date()
    })

    // Create alert if integration is down
    if (status.status === 'down') {
      this.createAlert(
        'integration',
        'high',
        `${service} Integration Down`,
        `The ${service} integration is currently down. Last error: ${status.lastError || 'Unknown error'}`,
        service,
        { service, status: status.status }
      )
    }
  }

  // Health Checks
  async checkIntegrationHealth(service: string): Promise<IntegrationStatus> {
    const startTime = Date.now()
    
    try {
      let response: Response
      
      switch (service) {
        case 'stripe':
          response = await fetch('/api/health/stripe', { method: 'GET' })
          break
        case 'google-calendar':
          response = await fetch('/api/health/google-calendar', { method: 'GET' })
          break
        case 'twilio':
          response = await fetch('/api/health/twilio', { method: 'GET' })
          break
        case 'vapi':
          response = await fetch('/api/health/vapi', { method: 'GET' })
          break
        default:
          throw new Error(`Unknown service: ${service}`)
      }

      const responseTime = Date.now() - startTime
      const isHealthy = response.ok && responseTime < 5000 // 5 second timeout

      const status: IntegrationStatus = {
        service,
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        responseTime,
        errorRate: isHealthy ? 0 : 1
      }

      this.updateIntegrationStatus(service, status)
      return status
    } catch (error) {
      const status: IntegrationStatus = {
        service,
        status: 'down',
        lastCheck: new Date(),
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }

      this.updateIntegrationStatus(service, status)
      return status
    }
  }

  // Data Retrieval
  getErrorLogs(limit: number = 50): ErrorLog[] {
    return this.errorLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  getAlerts(limit: number = 20): SystemAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  getMetrics(metric: string, timeRange: number = 3600000): PerformanceMetric[] { // 1 hour default
    const cutoff = new Date(Date.now() - timeRange)
    return this.metrics
      .filter(m => m.metric === metric && m.timestamp > cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  getIntegrationStatuses(): IntegrationStatus[] {
    return Array.from(this.integrationStatuses.values())
  }

  // Dashboard Statistics
  getDashboardStats() {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const recentErrors = this.errorLogs.filter(log => 
      log.timestamp > last24Hours && log.level === 'error'
    )
    
    const unacknowledgedAlerts = this.alerts.filter(alert => !alert.acknowledged)
    
    const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical')
    
    const downIntegrations = Array.from(this.integrationStatuses.values())
      .filter(status => status.status === 'down')

    return {
      totalErrors: recentErrors.length,
      unacknowledgedAlerts: unacknowledgedAlerts.length,
      criticalAlerts: criticalAlerts.length,
      downIntegrations: downIntegrations.length,
      systemHealth: this.calculateSystemHealth()
    }
  }

  // Private Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context
    return undefined
  }

  private getCurrentSessionId(): string | undefined {
    // Get from session storage
    return sessionStorage.getItem('sessionId') || undefined
  }

  private checkForErrorThresholds(): void {
    const now = new Date()
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000)
    
    const recentErrors = this.errorLogs.filter(log => 
      log.timestamp > last5Minutes && log.level === 'error'
    )

    if (recentErrors.length > 10) {
      this.createAlert(
        'error',
        'high',
        'High Error Rate Detected',
        `${recentErrors.length} errors in the last 5 minutes`,
        'error-monitor',
        { errorCount: recentErrors.length, timeWindow: '5 minutes' }
      )
    }
  }

  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    // Check for performance degradation
    if (metric.metric === 'response_time' && metric.value > 5000) {
      this.createAlert(
        'performance',
        'medium',
        'Slow Response Time',
        `Response time is ${metric.value}ms, above threshold of 5000ms`,
        'performance-monitor',
        { metric: metric.metric, value: metric.value, threshold: 5000 }
      )
    }
  }

  private calculateSystemHealth(): 'healthy' | 'degraded' | 'critical' {
    const stats = this.getDashboardStats()
    
    if (stats.criticalAlerts > 0 || stats.downIntegrations > 0) {
      return 'critical'
    }
    
    if (stats.unacknowledgedAlerts > 3 || stats.totalErrors > 20) {
      return 'degraded'
    }
    
    return 'healthy'
  }

  private notifyAlert(alert: SystemAlert): void {
    // Send to external notification service
    if (alert.severity === 'critical') {
      // Send immediate notification
      console.error('CRITICAL ALERT:', alert)
    }
  }

  private sendToExternalService(_errorLog: ErrorLog): void {
    // Send to external logging service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // Implementation would go here
    }
  }

  // Cleanup old data
  cleanup(): void {
    const now = new Date()
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days

    this.errorLogs = this.errorLogs.filter(log => log.timestamp > cutoff)
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff)
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff)
  }
}

export const MonitoringService = new MonitoringServiceClass()

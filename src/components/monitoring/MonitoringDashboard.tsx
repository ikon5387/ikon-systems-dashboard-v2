import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiActivity,
  FiServer,
  FiDatabase,
  FiGlobe,
} from 'react-icons/fi'
import { MonitoringService, ErrorLog, SystemAlert, IntegrationStatus } from '@/services/monitoring/MonitoringService'

export function MonitoringDashboard() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatus[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [logs, alertsData, integrations, stats] = await Promise.all([
        Promise.resolve(MonitoringService.getErrorLogs(20)),
        Promise.resolve(MonitoringService.getAlerts(10)),
        Promise.resolve(MonitoringService.getIntegrationStatuses()),
        Promise.resolve(MonitoringService.getDashboardStats())
      ])

      setErrorLogs(logs)
      setAlerts(alertsData)
      setIntegrationStatuses(integrations)
      setDashboardStats(stats)
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIntegrationHealth = async (service: string) => {
    try {
      await MonitoringService.checkIntegrationHealth(service)
      loadData() // Reload data to get updated status
    } catch (error) {
      console.error(`Failed to check ${service} health:`, error)
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    MonitoringService.acknowledgeAlert(alertId, 'current-user')
    loadData()
  }

  useEffect(() => {
    loadData()

    if (autoRefresh) {
      const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded':
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'down':
        return <FiXCircle className="w-5 h-5 text-red-500" />
      default:
        return <FiClock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive',
      unknown: 'secondary'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'high':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2"
          >
            {autoRefresh ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
            <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                  <p className={`text-2xl font-bold ${getSystemHealthColor(dashboardStats.systemHealth)}`}>
                    {dashboardStats.systemHealth.toUpperCase()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                  <FiActivity className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Errors (24h)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.totalErrors}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                  <FiXCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.unacknowledgedAlerts}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                  <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Down Services</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.downIntegrations}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                  <FiServer className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FiGlobe className="w-5 h-5" />
              <span>Integration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrationStatuses.map((integration) => (
                <div key={integration.service} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {integration.service.replace('-', ' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last check: {integration.lastCheck.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(integration.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => checkIntegrationHealth(integration.service)}
                    >
                      Check
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FiAlertTriangle className="w-5 h-5" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {alert.message}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="ml-2"
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FiCheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FiDatabase className="w-5 h-5" />
            <span>Recent Error Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {errorLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge 
                        variant={log.level === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {log.level}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {log.message}
                    </p>
                    {log.context && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Context: {JSON.stringify(log.context)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.resolved ? (
                      <Badge variant="default" className="text-xs">Resolved</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Open</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {errorLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FiCheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No recent errors</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

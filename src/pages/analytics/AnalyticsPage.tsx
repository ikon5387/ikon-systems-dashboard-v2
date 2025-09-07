import { useState } from 'react'
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiCalendar,
  FiPhone,
  FiBarChart,
  FiPieChart,
  FiRefreshCw,
  FiDownload,
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAnalyticsData, useRevenueChartData, useClientGrowthData, useProjectStatusData, useAppointmentTrendsData } from '@/hooks/useAnalytics'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useRealtimeClients, useRealtimeProjects, useRealtimeAppointments, useRealtimeFinancials } from '@/hooks/useRealtime'
import { useQueryClient } from '@tanstack/react-query'

// Mock chart components (you can replace these with actual Chart.js components)
const RevenueChart = ({ data: _data }: { data: any }) => (
  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
    <div className="text-center">
      <FiBarChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
      <p className="text-slate-600 dark:text-slate-400">Revenue Chart</p>
      <p className="text-sm text-slate-500 dark:text-slate-500">Chart.js integration needed</p>
    </div>
  </div>
)

const ClientGrowthChart = ({ data: _data }: { data: any }) => (
  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
    <div className="text-center">
      <FiTrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
      <p className="text-slate-600 dark:text-slate-400">Client Growth Chart</p>
      <p className="text-sm text-slate-500 dark:text-slate-500">Chart.js integration needed</p>
    </div>
  </div>
)

const ProjectStatusChart = ({ data: _data }: { data: any }) => (
  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
    <div className="text-center">
      <FiPieChart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
      <p className="text-slate-600 dark:text-slate-400">Project Status Chart</p>
      <p className="text-sm text-slate-500 dark:text-slate-500">Chart.js integration needed</p>
    </div>
  </div>
)

const AppointmentTrendsChart = ({ data: _data }: { data: any }) => (
  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
    <div className="text-center">
      <FiActivity className="w-12 h-12 text-slate-400 mx-auto mb-2" />
      <p className="text-slate-600 dark:text-slate-400">Appointment Trends Chart</p>
      <p className="text-sm text-slate-500 dark:text-slate-500">Chart.js integration needed</p>
    </div>
  </div>
)

export function AnalyticsPage() {
  const { isAuthenticated } = useAuth()
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | '24m'>('12m')
  const queryClient = useQueryClient()

  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsData()
  const { data: revenueChartData, isLoading: revenueLoading } = useRevenueChartData(timeRange === '6m' ? 6 : timeRange === '12m' ? 12 : 24)
  const { data: clientGrowthData, isLoading: clientGrowthLoading } = useClientGrowthData(timeRange === '6m' ? 6 : timeRange === '12m' ? 12 : 24)
  const { data: projectStatusData, isLoading: projectStatusLoading } = useProjectStatusData()
  const { data: appointmentTrendsData, isLoading: appointmentTrendsLoading } = useAppointmentTrendsData(6)

  // Real-time updates for all analytics data
  useRealtimeClients((payload) => {
    console.log('Real-time client update in analytics:', payload)
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['clientGrowth'] })
  })

  useRealtimeProjects((payload) => {
    console.log('Real-time project update in analytics:', payload)
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['projectStatus'] })
  })

  useRealtimeAppointments((payload) => {
    console.log('Real-time appointment update in analytics:', payload)
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['appointmentTrends'] })
  })

  useRealtimeFinancials((payload) => {
    console.log('Real-time financial update in analytics:', payload)
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    queryClient.invalidateQueries({ queryKey: ['revenueChart'] })
  })

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please sign in to view analytics.
          </p>
        </div>
      </div>
    )
  }

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    )
  }

  if (analyticsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {analyticsError.message || 'Failed to load analytics data. Please try again.'}
          </p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            No Analytics Data
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Start adding clients, projects, and appointments to see analytics.
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
          <h1 className="text-3xl font-bold gradient-text">Business Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '6m' | '12m' | '24m')}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="24m">Last 24 months</option>
          </select>
          <Button
            variant="outline"
            className="hover-lift border-primary/20 text-primary hover:bg-primary/10"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            className="hover-lift border-primary/20 text-primary hover:bg-primary/10"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <Card className="card-hover bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Clients
            </CardTitle>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FiUsers className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {formatNumber(analyticsData.clients.total)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
              {analyticsData.clients.growth >= 0 ? (
                <FiTrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <FiTrendingDown className="w-3 h-3 mr-1" />
              )}
              <span className={`font-medium ${analyticsData.clients.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {analyticsData.clients.growth.toFixed(1)}%
              </span> growth
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="card-hover bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Total Revenue
            </CardTitle>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <FiDollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(analyticsData.revenue.total)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
              {analyticsData.revenue.growth >= 0 ? (
                <FiTrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <FiTrendingDown className="w-3 h-3 mr-1" />
              )}
              <span className={`font-medium ${analyticsData.revenue.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {analyticsData.revenue.growth.toFixed(1)}%
              </span> growth
            </p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="card-hover bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Active Projects
            </CardTitle>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <FiActivity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {formatNumber(analyticsData.projects.active)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
              <FiActivity className="w-3 h-3 mr-1" />
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {analyticsData.projects.completed}
              </span> completed
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="card-hover bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Upcoming Appointments
            </CardTitle>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <FiCalendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {formatNumber(analyticsData.appointments.upcoming)}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
              <FiCalendar className="w-3 h-3 mr-1" />
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {analyticsData.appointments.completed}
              </span> completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center">
              <FiBarChart className="w-5 h-5 mr-2" />
              Revenue & Expenses
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monthly revenue and expense trends
            </p>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner size="md" text="Loading chart..." />
              </div>
            ) : (
              <RevenueChart data={revenueChartData} />
            )}
          </CardContent>
        </Card>

        {/* Client Growth Chart */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2" />
              Client Growth
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              New clients acquired over time
            </p>
          </CardHeader>
          <CardContent>
            {clientGrowthLoading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner size="md" text="Loading chart..." />
              </div>
            ) : (
              <ClientGrowthChart data={clientGrowthData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Chart */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center">
              <FiPieChart className="w-5 h-5 mr-2" />
              Project Status Distribution
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Current status of all projects
            </p>
          </CardHeader>
          <CardContent>
            {projectStatusLoading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner size="md" text="Loading chart..." />
              </div>
            ) : (
              <ProjectStatusChart data={projectStatusData} />
            )}
          </CardContent>
        </Card>

        {/* Appointment Trends Chart */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center">
              <FiActivity className="w-5 h-5 mr-2" />
              Appointment Trends
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Appointment scheduling and completion trends
            </p>
          </CardHeader>
          <CardContent>
            {appointmentTrendsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner size="md" text="Loading chart..." />
              </div>
            ) : (
              <AppointmentTrendsChart data={appointmentTrendsData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Client Breakdown */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center">
              <FiUsers className="w-5 h-5 mr-2" />
              Client Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatNumber(analyticsData.clients.active)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Leads</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatNumber(analyticsData.clients.leads)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Prospects</span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                {formatNumber(analyticsData.clients.prospects)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Churned</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatNumber(analyticsData.clients.churned)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Project Performance */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center">
              <FiActivity className="w-5 h-5 mr-2" />
              Project Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Projects</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatNumber(analyticsData.projects.total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatNumber(analyticsData.projects.completed)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">On Time</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatNumber(analyticsData.projects.onTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Overdue</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatNumber(analyticsData.projects.overdue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Voice Agent Performance */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center">
              <FiPhone className="w-5 h-5 mr-2" />
              Voice Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Agents</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatNumber(analyticsData.voiceAgents.total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active Agents</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatNumber(analyticsData.voiceAgents.active)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Calls</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatNumber(analyticsData.voiceAgents.totalCalls)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Success Rate</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {analyticsData.voiceAgents.successRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

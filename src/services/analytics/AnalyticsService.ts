import { BaseService, ServiceResponse } from '../base/BaseService'
import { supabase } from '@/lib/supabase'

export interface AnalyticsData {
  clients: {
    total: number
    active: number
    leads: number
    prospects: number
    churned: number
    growth: number
  }
  revenue: {
    total: number
    monthly: number
    growth: number
    averageDealSize: number
  }
  projects: {
    total: number
    active: number
    completed: number
    onTime: number
    overdue: number
  }
  appointments: {
    total: number
    upcoming: number
    completed: number
    cancelled: number
    noShow: number
  }
  voiceAgents: {
    total: number
    active: number
    totalCalls: number
    averageCallDuration: number
    successRate: number
  }
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

export interface TimeSeriesData {
  date: string
  value: number
  label: string
}

class AnalyticsServiceClass extends BaseService {
  protected tableName = 'analytics'

  async getAnalyticsData(): Promise<ServiceResponse<AnalyticsData>> {
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.toISOString().slice(0, 7)
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().slice(0, 7)

      // Get client analytics
      const { data: clientsData } = await supabase
        .from('clients')
        .select('status, created_at')

      const totalClients = clientsData?.length || 0
      const activeClients = clientsData?.filter(c => c.status === 'active').length || 0
      const leads = clientsData?.filter(c => c.status === 'lead').length || 0
      const prospects = clientsData?.filter(c => c.status === 'prospect').length || 0
      const churned = clientsData?.filter(c => c.status === 'churned').length || 0

      // Calculate client growth
      const lastMonthClients = clientsData?.filter(c => 
        new Date(c.created_at).toISOString().slice(0, 7) === lastMonth
      ).length || 0
      const currentMonthClients = clientsData?.filter(c => 
        new Date(c.created_at).toISOString().slice(0, 7) === currentMonth
      ).length || 0
      const clientGrowth = lastMonthClients > 0 ? ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100 : 0

      // Get revenue analytics
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, payment_date')

      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0
      const monthlyRevenue = paymentsData?.filter(p => 
        p.payment_date.startsWith(currentMonth)
      ).reduce((sum, payment) => sum + payment.amount, 0) || 0

      const lastMonthRevenue = paymentsData?.filter(p => 
        p.payment_date.startsWith(lastMonth)
      ).reduce((sum, payment) => sum + payment.amount, 0) || 0

      const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
      const averageDealSize = paymentsData && paymentsData.length > 0 ? totalRevenue / paymentsData.length : 0

      // Get project analytics
      const { data: projectsData } = await supabase
        .from('projects')
        .select('status, due_date, completed_at')

      const totalProjects = projectsData?.length || 0
      const activeProjects = projectsData?.filter(p => p.status === 'active').length || 0
      const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0
      const onTimeProjects = projectsData?.filter(p => 
        p.status === 'completed' && p.completed_at && p.due_date && 
        new Date(p.completed_at) <= new Date(p.due_date)
      ).length || 0
      const overdueProjects = projectsData?.filter(p => 
        p.status !== 'completed' && p.due_date && new Date(p.due_date) < currentDate
      ).length || 0

      // Get appointment analytics
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('status, date_time')

      const totalAppointments = appointmentsData?.length || 0
      const upcomingAppointments = appointmentsData?.filter(a => 
        a.status === 'scheduled' && new Date(a.date_time) > currentDate
      ).length || 0
      const completedAppointments = appointmentsData?.filter(a => a.status === 'completed').length || 0
      const cancelledAppointments = appointmentsData?.filter(a => a.status === 'cancelled').length || 0
      const noShowAppointments = appointmentsData?.filter(a => a.status === 'no_show').length || 0

      // Get voice agent analytics
      const { data: voiceAgentsData } = await supabase
        .from('voice_agents')
        .select('status, total_calls, average_call_duration, success_rate')

      const totalVoiceAgents = voiceAgentsData?.length || 0
      const activeVoiceAgents = voiceAgentsData?.filter(v => v.status === 'active').length || 0
      const totalCalls = voiceAgentsData?.reduce((sum, agent) => sum + (agent.total_calls || 0), 0) || 0
      const averageCallDuration = voiceAgentsData && voiceAgentsData.length > 0 ? 
        voiceAgentsData.reduce((sum, agent) => sum + (agent.average_call_duration || 0), 0) / voiceAgentsData.length : 0
      const successRate = voiceAgentsData && voiceAgentsData.length > 0 ? 
        voiceAgentsData.reduce((sum, agent) => sum + (agent.success_rate || 0), 0) / voiceAgentsData.length : 0

      const analyticsData: AnalyticsData = {
        clients: {
          total: totalClients,
          active: activeClients,
          leads,
          prospects,
          churned,
          growth: clientGrowth
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          growth: revenueGrowth,
          averageDealSize
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          onTime: onTimeProjects,
          overdue: overdueProjects
        },
        appointments: {
          total: totalAppointments,
          upcoming: upcomingAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          noShow: noShowAppointments
        },
        voiceAgents: {
          total: totalVoiceAgents,
          active: activeVoiceAgents,
          totalCalls,
          averageCallDuration,
          successRate
        }
      }

      return { data: analyticsData, error: null, success: true }
    } catch (error) {
      console.error('Error in getAnalyticsData:', error)
      return { data: null, error: 'Failed to fetch analytics data', success: false }
    }
  }

  async getRevenueChartData(months: number = 12): Promise<ServiceResponse<ChartData>> {
    try {
      const chartData: ChartData = {
        labels: [],
        datasets: [
          {
            label: 'Revenue',
            data: [],
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 1)',
            fill: true
          },
          {
            label: 'Expenses',
            data: [],
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 1)',
            fill: true
          }
        ]
      }

      const currentDate = new Date()

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const month = date.toISOString().slice(0, 7)
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 7)

        chartData.labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))

        // Get revenue for this month
        const { data: revenueData } = await supabase
          .from('payments')
          .select('amount')
          .gte('payment_date', `${month}-01`)
          .lt('payment_date', `${nextMonth}-01`)

        const revenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0
        chartData.datasets[0].data.push(revenue)

        // Get expenses for this month
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('amount')
          .gte('expense_date', `${month}-01`)
          .lt('expense_date', `${nextMonth}-01`)

        const expenses = expensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0
        chartData.datasets[1].data.push(expenses)
      }

      return { data: chartData, error: null, success: true }
    } catch (error) {
      console.error('Error in getRevenueChartData:', error)
      return { data: null, error: 'Failed to fetch revenue chart data', success: false }
    }
  }

  async getClientGrowthData(months: number = 12): Promise<ServiceResponse<ChartData>> {
    try {
      const chartData: ChartData = {
        labels: [],
        datasets: [
          {
            label: 'New Clients',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            fill: true
          }
        ]
      }

      const currentDate = new Date()

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const month = date.toISOString().slice(0, 7)
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 7)

        chartData.labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))

        // Get new clients for this month
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id')
          .gte('created_at', `${month}-01`)
          .lt('created_at', `${nextMonth}-01`)

        const newClients = clientsData?.length || 0
        chartData.datasets[0].data.push(newClients)
      }

      return { data: chartData, error: null, success: true }
    } catch (error) {
      console.error('Error in getClientGrowthData:', error)
      return { data: null, error: 'Failed to fetch client growth data', success: false }
    }
  }

  async getProjectStatusData(): Promise<ServiceResponse<ChartData>> {
    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('status')

      const statusCounts = {
        planning: 0,
        active: 0,
        completed: 0,
        on_hold: 0,
        cancelled: 0
      }

      projectsData?.forEach(project => {
        if (project.status in statusCounts) {
          statusCounts[project.status as keyof typeof statusCounts]++
        }
      })

      const chartData: ChartData = {
        labels: Object.keys(statusCounts).map(key => 
          key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
        ),
        datasets: [
          {
            label: 'Projects',
            data: Object.values(statusCounts),
            backgroundColor: 'rgba(59, 130, 246, 0.8)'
          }
        ]
      }

      return { data: chartData, error: null, success: true }
    } catch (error) {
      console.error('Error in getProjectStatusData:', error)
      return { data: null, error: 'Failed to fetch project status data', success: false }
    }
  }

  async getAppointmentTrendsData(months: number = 6): Promise<ServiceResponse<ChartData>> {
    try {
      const chartData: ChartData = {
        labels: [],
        datasets: [
          {
            label: 'Scheduled',
            data: [],
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 1)',
            fill: true
          },
          {
            label: 'Completed',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            fill: true
          },
          {
            label: 'Cancelled',
            data: [],
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 1)',
            fill: true
          }
        ]
      }

      const currentDate = new Date()

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const month = date.toISOString().slice(0, 7)
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 7)

        chartData.labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))

        // Get appointments for this month
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('status')
          .gte('date_time', `${month}-01`)
          .lt('date_time', `${nextMonth}-01`)

        const scheduled = appointmentsData?.filter(a => a.status === 'scheduled').length || 0
        const completed = appointmentsData?.filter(a => a.status === 'completed').length || 0
        const cancelled = appointmentsData?.filter(a => a.status === 'cancelled').length || 0

        chartData.datasets[0].data.push(scheduled)
        chartData.datasets[1].data.push(completed)
        chartData.datasets[2].data.push(cancelled)
      }

      return { data: chartData, error: null, success: true }
    } catch (error) {
      console.error('Error in getAppointmentTrendsData:', error)
      return { data: null, error: 'Failed to fetch appointment trends data', success: false }
    }
  }
}

export const AnalyticsService = new AnalyticsServiceClass()

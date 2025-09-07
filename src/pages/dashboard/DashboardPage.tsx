import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp, 
  FiActivity, 
  FiPlus, 
  FiCalendar,
  FiPhone,
  FiArrowUpRight,
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingCard } from '@/components/ui/LoadingSpinner'
import { MRRChart } from '@/components/charts/MRRChart'
import { useClientStats } from '@/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeClients } from '@/hooks/useRealtime'
import { useQueryClient } from '@tanstack/react-query'

// Mock data for demonstration
const mockStats = {
  total: 124,
  active: 89,
  leads: 12,
  prospects: 45,
  churned: 8,
  bilingualClients: 23,
  recentlyAdded: 5
}

const mockRecentActivity = [
  {
    id: 1,
    type: 'client',
    action: 'New client added',
    name: 'John Smith',
    time: '2 hours ago',
    icon: FiUsers,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    id: 2,
    type: 'appointment',
    action: 'Appointment scheduled',
    name: 'Sarah Johnson',
    time: '4 hours ago',
    icon: FiCalendar,
    color: 'text-green-600 bg-green-100'
  },
  {
    id: 3,
    type: 'payment',
    action: 'Payment received',
    name: 'Mike Davis',
    time: '6 hours ago',
    icon: FiDollarSign,
    color: 'text-emerald-600 bg-emerald-100'
  },
  {
    id: 4,
    type: 'call',
    action: 'Missed call',
    name: 'Lisa Wilson',
    time: '1 day ago',
    icon: FiPhone,
    color: 'text-red-600 bg-red-100'
  }
]

const mockUpcomingAppointments = [
  {
    id: 1,
    client: 'John Smith',
    time: 'Today, 2:00 PM',
    type: 'Demo',
    status: 'confirmed'
  },
  {
    id: 2,
    client: 'Sarah Johnson',
    time: 'Tomorrow, 10:00 AM',
    type: 'Follow-up',
    status: 'pending'
  },
  {
    id: 3,
    client: 'Mike Davis',
    time: 'Tomorrow, 3:30 PM',
    type: 'Call',
    status: 'confirmed'
  }
]

export function DashboardPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const { data: stats, isLoading: statsLoading } = useClientStats()
  const queryClient = useQueryClient()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Real-time updates for client data
  useRealtimeClients((payload) => {
    console.log('Real-time client update:', payload)
    // Invalidate and refetch client stats when clients change
    queryClient.invalidateQueries({ queryKey: ['clientStats'] })
    queryClient.invalidateQueries({ queryKey: ['clients'] })
  })

  if (loading || statsLoading) {
    return (
      <div className="space-y-8">
        <div className="fade-in-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  const displayStats = stats || mockStats

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between animate-slide-in-up">
        <div>
          <h1 className="text-3xl font-bold text-gradient animate-fade-in">
            Welcome back, {profile?.email === 'contact@ikonsystemsai.com' ? 'Jeffrey' : (profile?.email?.split('@')[0] || 'User')}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 button-glow hover-lift-smooth neon-glow"
          >
            <Link to="/clients/new">
              <FiPlus className="w-4 h-4 mr-2" />
              Add Client
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="glass-effect hover-lift-smooth border-primary/20 text-primary hover:bg-primary/10"
          >
            <Link to="/appointments/new">
              <FiCalendar className="w-4 h-4 mr-2" />
              Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <Card className="stagger-fade-in interactive-card glass-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
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
              {displayStats.total || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
              <FiArrowUpRight className="w-3 h-3 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                +{displayStats.recentlyAdded || 0}
              </span> this week
            </p>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card className="stagger-fade-in interactive-card glass-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Active Clients
            </CardTitle>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <FiActivity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {displayStats.active || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
              <FiArrowUpRight className="w-3 h-3 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                {displayStats.prospects || 0}
              </span> prospects
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="stagger-fade-in interactive-card glass-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Monthly Revenue
            </CardTitle>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <FiDollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {displayStats.bilingualClients || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
              <FiArrowUpRight className="w-3 h-3 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                bilingual
              </span> clients
            </p>
          </CardContent>
        </Card>

        {/* New Leads */}
        <Card className="stagger-fade-in interactive-card glass-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              New Leads
            </CardTitle>
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {displayStats.leads || 0}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
              <FiArrowUpRight className="w-3 h-3 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                new leads
              </span> this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MRR Chart */}
      <MRRChart />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 card-hover glass-effect">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700">
            <CardTitle className="gradient-text">Recent Activity</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">Latest business updates</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {mockRecentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {activity.action}
                    </p>
                    <p className="text-sm text-primary font-medium">{activity.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="card-hover glass-effect">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="gradient-text">Upcoming Appointments</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your schedule for the next few days</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover-lift border-primary/20 text-primary hover:bg-primary/10"
              >
                <Link to="/appointments">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {mockUpcomingAppointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg hover:from-primary/5 hover:to-primary/10 transition-all duration-200 hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {appointment.client}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {appointment.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold gradient-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/clients/new">
            <Card className="cursor-pointer card-hover group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <FiUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      Add Client
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Create new client profile</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/appointments/new">
            <Card className="cursor-pointer card-hover group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <FiCalendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                      Schedule Demo
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Book client demonstration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/voice-agents">
            <Card className="cursor-pointer card-hover group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <FiPhone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      Voice Agent
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage AI agents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/financials/new">
            <Card className="cursor-pointer card-hover group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <FiDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                      Create Invoice
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Generate new invoice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

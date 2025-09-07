import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi'
import { formatCurrency } from '@/lib/utils'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MRRDataPoint {
  month: string
  mrr: number
  newRevenue: number
  churn: number
  expansion: number
}

interface MRRChartProps {
  data?: MRRDataPoint[]
  className?: string
}

// Mock data for demonstration - in real app, this would come from your API
const mockMRRData: MRRDataPoint[] = [
  { month: 'Jan 2024', mrr: 12500, newRevenue: 2000, churn: -500, expansion: 800 },
  { month: 'Feb 2024', mrr: 13800, newRevenue: 1800, churn: -300, expansion: 1200 },
  { month: 'Mar 2024', mrr: 15200, newRevenue: 2200, churn: -400, expansion: 1000 },
  { month: 'Apr 2024', mrr: 16800, newRevenue: 2500, churn: -600, expansion: 1500 },
  { month: 'May 2024', mrr: 18200, newRevenue: 2100, churn: -200, expansion: 1800 },
  { month: 'Jun 2024', mrr: 19800, newRevenue: 2800, churn: -400, expansion: 2000 },
  { month: 'Jul 2024', mrr: 21500, newRevenue: 3000, churn: -500, expansion: 2200 },
  { month: 'Aug 2024', mrr: 23200, newRevenue: 2700, churn: -300, expansion: 2500 },
  { month: 'Sep 2024', mrr: 24800, newRevenue: 2600, churn: -400, expansion: 2800 },
  { month: 'Oct 2024', mrr: 26500, newRevenue: 3200, churn: -600, expansion: 3000 },
  { month: 'Nov 2024', mrr: 28100, newRevenue: 2900, churn: -300, expansion: 3200 },
  { month: 'Dec 2024', mrr: 29800, newRevenue: 3500, churn: -400, expansion: 3500 },
]

export function MRRChart({ data = mockMRRData, className = '' }: MRRChartProps) {
  const chartData = useMemo(() => {
    const labels = data.map(d => d.month)
    const mrrValues = data.map(d => d.mrr)
    const newRevenueValues = data.map(d => d.newRevenue)
    const churnValues = data.map(d => Math.abs(d.churn))
    const expansionValues = data.map(d => d.expansion)

    return {
      labels,
      datasets: [
        {
          label: 'MRR',
          data: mrrValues,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: 'New Revenue',
          data: newRevenueValues,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Expansion',
          data: expansionValues,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgb(168, 85, 247)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Churn',
          data: churnValues,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          color: 'rgb(71, 85, 105)', // slate-600
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: 'rgb(248, 250, 252)',
        bodyColor: 'rgb(248, 250, 252)',
        borderColor: 'rgba(71, 85, 105, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${formatCurrency(value)}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(71, 85, 105)',
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(71, 85, 105, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(71, 85, 105)',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return formatCurrency(value)
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ffffff',
        hoverBorderWidth: 3,
      },
    },
  }

  // Calculate growth metrics
  const currentMRR = data[data.length - 1]?.mrr || 0
  const previousMRR = data[data.length - 2]?.mrr || 0
  const growthRate = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0
  const isGrowing = growthRate > 0

  const totalNewRevenue = data.reduce((sum, d) => sum + d.newRevenue, 0)
  const totalChurn = data.reduce((sum, d) => sum + Math.abs(d.churn), 0)
  const totalExpansion = data.reduce((sum, d) => sum + d.expansion, 0)

  return (
    <Card className={`card-hover glass-effect ${className}`}>
      <CardHeader className="border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="gradient-text flex items-center">
              <FiDollarSign className="w-5 h-5 mr-2" />
              Monthly Recurring Revenue
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Track your subscription revenue growth
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(currentMRR)}
            </div>
            <div className={`flex items-center text-sm ${
              isGrowing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isGrowing ? (
                <FiTrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <FiTrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(growthRate).toFixed(1)}% vs last month
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Chart */}
        <div className="h-80 mb-6">
          <Line data={chartData} options={options} />
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">New Revenue</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(totalNewRevenue)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Expansion</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(totalExpansion)}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Churn</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  -{formatCurrency(totalChurn)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <FiTrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

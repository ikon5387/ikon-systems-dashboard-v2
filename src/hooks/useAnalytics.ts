import { useQuery } from '@tanstack/react-query'
import { AnalyticsService } from '@/services/analytics/AnalyticsService'

// Query Keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  data: () => [...analyticsKeys.all, 'data'] as const,
  revenueChart: (months: number) => [...analyticsKeys.all, 'revenueChart', months] as const,
  clientGrowth: (months: number) => [...analyticsKeys.all, 'clientGrowth', months] as const,
  projectStatus: () => [...analyticsKeys.all, 'projectStatus'] as const,
  appointmentTrends: (months: number) => [...analyticsKeys.all, 'appointmentTrends', months] as const,
}

// Analytics Data Hook
export function useAnalyticsData() {
  return useQuery({
    queryKey: analyticsKeys.data(),
    queryFn: () => AnalyticsService.getAnalyticsData(),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

// Revenue Chart Data Hook
export function useRevenueChartData(months: number = 12) {
  return useQuery({
    queryKey: analyticsKeys.revenueChart(months),
    queryFn: () => AnalyticsService.getRevenueChartData(months),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  })
}

// Client Growth Chart Data Hook
export function useClientGrowthData(months: number = 12) {
  return useQuery({
    queryKey: analyticsKeys.clientGrowth(months),
    queryFn: () => AnalyticsService.getClientGrowthData(months),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  })
}

// Project Status Chart Data Hook
export function useProjectStatusData() {
  return useQuery({
    queryKey: analyticsKeys.projectStatus(),
    queryFn: () => AnalyticsService.getProjectStatusData(),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  })
}

// Appointment Trends Chart Data Hook
export function useAppointmentTrendsData(months: number = 6) {
  return useQuery({
    queryKey: analyticsKeys.appointmentTrends(months),
    queryFn: () => AnalyticsService.getAppointmentTrendsData(months),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  })
}

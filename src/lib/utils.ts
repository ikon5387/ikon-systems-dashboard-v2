import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = "MMM dd, yyyy") {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

export function formatDateTime(date: string | Date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, "MMM dd, yyyy 'at' h:mm a")
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatTime(date: string | Date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, "h:mm a")
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'paid':
      return 'text-green-600 bg-green-100'
    case 'pending':
    case 'scheduled':
    case 'proposal':
      return 'text-yellow-600 bg-yellow-100'
    case 'inactive':
    case 'missed':
    case 'overdue':
      return 'text-red-600 bg-red-100'
    case 'lead':
      return 'text-blue-600 bg-blue-100'
    case 'prospect':
      return 'text-purple-600 bg-purple-100'
    case 'churned':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
} 
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getRiskColor(risk: string | null): string {
  switch (risk) {
    case 'low':
      return 'text-emerald-600'
    case 'medium':
      return 'text-amber-600'
    case 'high':
      return 'text-red-600'
    default:
      return 'text-gray-400'
  }
}

export function getRiskBgColor(risk: string | null): string {
  switch (risk) {
    case 'low':
      return 'bg-emerald-50'
    case 'medium':
      return 'bg-amber-50'
    case 'high':
      return 'bg-red-50'
    default:
      return 'bg-gray-50'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'processed':
      return 'text-emerald-600'
    case 'processing':
      return 'text-blue-600'
    case 'failed':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'processed':
      return 'bg-emerald-50'
    case 'processing':
      return 'bg-blue-50'
    case 'failed':
      return 'bg-red-50'
    default:
      return 'bg-gray-50'
  }
}

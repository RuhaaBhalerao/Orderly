import { FileText, Clock, AlertTriangle, CalendarDays, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'

interface KPICardProps {
  label: string
  value: number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  icon?: React.ReactNode
}

export function KPICard({
  label,
  value,
  subtitle,
  trend,
  icon,
}: KPICardProps) {
  const getDefaultIcon = () => {
    switch (label) {
      case 'Contracts Imported':
        return <FileText className="w-8 h-8 text-primary" />
      case 'Pending Review':
        return <Clock className="w-8 h-8 text-warning" />
      case 'High Risk':
        return <AlertTriangle className="w-8 h-8 text-error" />
      case 'Expiring Soon':
        return <CalendarDays className="w-8 h-8 text-success" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-card transition-all duration-200 hover:border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-gray-600 text-sm font-medium">{label}</div>
          <div className="flex items-baseline gap-3 mt-3">
            <div className="text-4xl font-bold text-gray-900">{value}</div>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg',
                  trend.direction === 'up'
                    ? 'bg-emerald-50 text-success'
                    : 'bg-error-light text-error'
                )}
              >
                <TrendingUp className={cn('w-4 h-4', trend.direction === 'down' && 'transform rotate-180')} />
                {trend.value}%
              </div>
            )}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
          )}
        </div>
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-subtle rounded-lg flex items-center justify-center">
          {icon || getDefaultIcon()}
        </div>
      </div>
    </div>
  )
}

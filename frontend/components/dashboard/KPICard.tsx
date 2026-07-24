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
        return <FileText className="w-8 h-8 text-blue-500" />
      case 'Pending Review':
        return <Clock className="w-8 h-8 text-amber-500" />
      case 'High Risk':
        return <AlertTriangle className="w-8 h-8 text-red-500" />
      case 'Expiring Soon':
        return <CalendarDays className="w-8 h-8 text-emerald-500" />
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-gray-600 text-sm font-medium">{label}</div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  trend.direction === 'up'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                )}
              >
                <TrendingUp className="w-4 h-4" />
                {trend.value}
              </div>
            )}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
          )}
        </div>
        <div className="flex-shrink-0">{icon || getDefaultIcon()}</div>
      </div>
    </div>
  )
}

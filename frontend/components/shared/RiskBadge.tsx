import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high' | null
  className?: string
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  if (!risk) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm',
          'bg-gray-100 text-gray-600',
          className
        )}
      >
        <span>—</span>
      </div>
    )
  }

  const configs = {
    low: {
      icon: Info,
      label: 'Low',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    medium: {
      icon: AlertCircle,
      label: 'Medium',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    high: {
      icon: AlertTriangle,
      label: 'High',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  }

  const config = configs[risk]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm',
        config.bg,
        config.color,
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </div>
  )
}

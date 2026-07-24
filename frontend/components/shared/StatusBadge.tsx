import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'processed' | 'processing' | 'failed'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    processed: {
      icon: CheckCircle,
      label: 'Processed',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    processing: {
      icon: Clock,
      label: 'Processing',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    failed: {
      icon: AlertCircle,
      label: 'Failed',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  }

  const config = configs[status]
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

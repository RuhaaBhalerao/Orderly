import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-mint-light text-forest border border-sage/60',
    success: 'bg-mint text-forest border border-sage/80 font-semibold',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-900 border border-rose-200/80',
    info: 'bg-emerald-50 text-emerald-900 border border-emerald-200/80',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-tight transition-colors',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

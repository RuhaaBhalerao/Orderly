import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  border?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  children,
  className,
  border = true,
  shadow = 'sm',
}: CardProps) {
  const shadowClasses = {
    none: '',
    sm: 'shadow-card',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg',
        border && 'border border-gray-200',
        shadowClasses[shadow],
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export function CardHeader({
  children,
  className,
  border = true,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-4',
        border && 'border-b border-gray-200',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export function CardFooter({
  children,
  className,
  border = true,
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4',
        border && 'border-t border-gray-200',
        className
      )}
    >
      {children}
    </div>
  )
}

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && (
        <div className="mb-4 text-warm-400">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-xl font-semibold text-charcoal">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-charcoal-muted">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button variant="secondary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState

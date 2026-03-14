import { CheckCircle, Clock, Circle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface VerificationStep {
  id: string
  title: string
  description: string
  status: 'not_started' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'expired'
  detail?: string
}

interface VerificationChecklistProps {
  steps: VerificationStep[]
  compact?: boolean
}

const statusConfig = {
  not_started: {
    icon: Circle,
    color: 'text-warm-400',
    bg: 'bg-warm-100',
    label: 'Not Started',
  },
  pending: {
    icon: Clock,
    color: 'text-warning-500',
    bg: 'bg-warning-50',
    label: 'Pending Review',
  },
  in_progress: {
    icon: Clock,
    color: 'text-warning-500',
    bg: 'bg-warning-50',
    label: 'In Progress',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-success-500',
    bg: 'bg-success-50',
    label: 'Verified',
  },
  rejected: {
    icon: AlertCircle,
    color: 'text-error-500',
    bg: 'bg-error-50',
    label: 'Rejected',
  },
  expired: {
    icon: AlertCircle,
    color: 'text-warning-700',
    bg: 'bg-warning-50',
    label: 'Expired',
  },
}

export function VerificationChecklist({ steps, compact = false }: VerificationChecklistProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const config = statusConfig[step.status]
        const Icon = config.icon

        if (compact) {
          return (
            <div key={step.id} className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', config.color)} />
              <span className="text-sm text-charcoal">{step.title}</span>
            </div>
          )
        }

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-start gap-4 rounded-xl p-4',
              config.bg
            )}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.color)} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-charcoal">{step.title}</h4>
                <span className={cn('text-xs font-medium', config.color)}>
                  {config.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-charcoal-muted">{step.description}</p>
              {step.detail && (
                <p className="mt-1 text-xs text-charcoal-muted">{step.detail}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default VerificationChecklist

import { Calendar, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BookingCardProps {
  id: string
  nannyName: string
  nannyAvatar?: string
  nannyCity: string
  bookingType: 'one_off' | 'regular' | 'live_in'
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  startDate: string
  endDate?: string
  totalAmount: number
  currency: string
  onViewDetails?: () => void
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-warning-50', text: 'text-warning-700', label: 'Pending' },
  confirmed: { bg: 'bg-success-50', text: 'text-success-700', label: 'Confirmed' },
  in_progress: { bg: 'bg-gold-400/10', text: 'text-gold-600', label: 'In Progress' },
  completed: { bg: 'bg-success-50', text: 'text-success-700', label: 'Completed' },
  cancelled: { bg: 'bg-warm-100', text: 'text-charcoal-muted', label: 'Cancelled' },
  disputed: { bg: 'bg-error-50', text: 'text-error-700', label: 'Disputed' },
}

const typeLabels: Record<string, string> = {
  one_off: 'One-Off',
  regular: 'Regular',
  live_in: 'Live-In',
}

const currencySymbols: Record<string, string> = {
  EUR: '\u20AC', USD: '$', QAR: 'QAR ',
}

export function BookingCard({
  nannyName,
  nannyAvatar,
  nannyCity,
  bookingType,
  status,
  startDate,
  endDate,
  totalAmount,
  currency,
  onViewDetails,
}: BookingCardProps) {
  const statusStyle = statusStyles[status]
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        {/* Nanny info */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-cream-200">
            {nannyAvatar ? (
              <img src={nannyAvatar} alt={nannyName} className="h-full w-full object-cover" />
            ) : (
              <span className="font-serif text-lg text-charcoal-muted">
                {nannyName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-serif text-base text-charcoal">{nannyName}</h4>
            <p className="flex items-center gap-1 text-xs text-charcoal-muted">
              <MapPin className="h-3 w-3" />
              {nannyCity}
            </p>
          </div>
        </div>

        {/* Status + Type badges */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-cream-200 px-2.5 py-1 text-xs font-medium text-charcoal-muted">
            {typeLabels[bookingType]}
          </span>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      <hr className="my-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-charcoal-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(startDate)}
            {endDate && ` - ${formatDate(endDate)}`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-serif text-lg text-charcoal">
            {currencySymbols[currency] || currency}{totalAmount}
          </span>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="text-sm font-medium text-gold-400 hover:text-gold-600"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingCard

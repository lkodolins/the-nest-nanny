import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/config/routes'
import { useBookings, useUpdateBookingStatus } from '@/queries/useBookings'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils/formatDate'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Booking } from '@/types/booking'

const statusStyles: Record<string, string> = {
  pending: 'bg-warning-50 text-warning-700',
  accepted: 'bg-success-50 text-success-700',
  declined: 'bg-error-50 text-error-700',
  confirmed: 'bg-success-50 text-success-700',
  in_progress: 'bg-gold-400/10 text-gold-600',
  'in-progress': 'bg-gold-400/10 text-gold-600',
  completed: 'bg-cream-200 text-charcoal-muted',
  cancelled: 'bg-error-50 text-error-700',
  disputed: 'bg-error-50 text-error-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
}

function getNannyName(b: Booking): string {
  if (b.nanny_card) {
    return `${b.nanny_card.first_name || ''} ${b.nanny_card.last_name || ''}`.trim() || '?'
  }
  return '?'
}

function getNannyAvatar(b: Booking): string | null {
  return b.nanny_card?.avatar || null
}

export function BookingsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const { data, isLoading, isError } = useBookings(statusFilter)
  const cancelMutation = useUpdateBookingStatus()

  const bookings: Booking[] = data?.results ?? []

  const handleCancel = (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate({ id: String(bookingId), status: 'cancelled' })
    }
  }

  // Compute stats from real data
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const upcomingCount = bookings.filter(
    (b) => ['pending', 'confirmed', 'accepted'].includes(b.status) && b.start_date && new Date(b.start_date) <= nextWeek
  ).length

  const thisMonthCount = bookings.filter(
    (b) => b.start_date && new Date(b.start_date) >= thisMonthStart
  ).length

  const thisMonthHours = bookings
    .filter((b) => b.start_date && new Date(b.start_date) >= thisMonthStart)
    .reduce((sum, b) => sum + parseFloat(b.hours_per_week || '0'), 0)

  const filterOptions = [
    { value: undefined, label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div>
      <p className="section-label mb-2">FAMILIES</p>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-heading-lg text-charcoal">Bookings</h1>
          <p className="mt-1 text-charcoal-muted">Manage your childcare sessions</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.FAMILY_SEARCH)}
          className="rounded-xl bg-gold-400 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500"
        >
          + New Booking
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <Skeleton width="50%" height={14} className="mb-2" />
              <Skeleton width="30%" height={24} className="mb-1" />
              <Skeleton width="40%" height={12} />
            </div>
          ))
        ) : (
          [
            { label: 'Upcoming', value: String(upcomingCount), sub: 'Next 7 days' },
            { label: 'This Month', value: String(thisMonthCount), sub: 'Total sessions' },
            { label: 'Hours Booked', value: String(thisMonthHours), sub: 'This month' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <p className="text-sm text-charcoal-muted">{s.label}</p>
              <p className="mt-1 font-serif text-2xl text-charcoal">{s.value}</p>
              <p className="mt-0.5 text-xs text-charcoal-muted">{s.sub}</p>
            </div>
          ))
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === opt.value
                ? 'bg-gold-400 text-white'
                : 'bg-cream-200 text-charcoal-muted hover:bg-cream-300'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <Skeleton width={48} height={48} rounded />
              <div className="flex-1 space-y-2">
                <Skeleton width="30%" height={16} />
                <Skeleton width="60%" height={12} />
              </div>
              <Skeleton width={70} height={24} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
          <p className="font-serif text-lg text-charcoal">Could not load bookings</p>
          <p className="mt-1 text-sm text-charcoal-muted">Please try again later.</p>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8" />}
          title="No bookings yet"
          description="Book a nanny to get started with your first session."
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const nannyName = getNannyName(b)
            const nannyAvatar = getNannyAvatar(b)
            const canCancel = ['pending', 'confirmed', 'accepted'].includes(b.status)

            return (
              <div
                key={b.id}
                className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold-400/10 font-serif text-sm text-gold-600">
                  {nannyAvatar ? (
                    <img src={nannyAvatar} alt={nannyName} className="h-full w-full object-cover" />
                  ) : (
                    nannyName.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal">{nannyName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-charcoal-muted">
                    {b.start_date && (
                      <>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(b.start_date)}
                        </span>
                        {b.start_time && b.end_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {b.start_time} - {b.end_time}
                          </span>
                        )}
                      </>
                    )}
                    {b.nanny_card?.city && (
                      <span>{b.nanny_card.city}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-charcoal">
                    {formatCurrency(parseFloat(b.total_amount || '0'), b.currency)}
                  </span>
                  <span className={cn('pill-badge text-xs font-medium', statusStyles[b.status] || 'bg-cream-200 text-charcoal-muted')}>
                    {statusLabels[b.status] || b.status}
                  </span>
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelMutation.isPending}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-error-700 transition-colors hover:bg-error-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BookingsPage

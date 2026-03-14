import { useState } from 'react'
import { Calendar, Clock, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui'
import { useBookings, useUpdateBookingStatus } from '@/queries/useBookings'
import type { Booking } from '@/types/booking'

const statusStyles: Record<string, string> = {
  confirmed: 'bg-success-50 text-success-700',
  accepted: 'bg-success-50 text-success-700',
  pending: 'bg-warning-50 text-warning-700',
  completed: 'bg-cream-200 text-charcoal-muted',
  cancelled: 'bg-error-50 text-error-700',
  declined: 'bg-error-50 text-error-700',
  in_progress: 'bg-gold-400/10 text-gold-600',
  'in-progress': 'bg-gold-400/10 text-gold-600',
  disputed: 'bg-error-50 text-error-700',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === now.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTimeRange(booking: Booking): string {
  if (!booking.start_time || !booking.end_time) return '--'
  return `${booking.start_time} - ${booking.end_time}`
}

function getFamilyName(b: Booking): string {
  if (b.family_user) {
    return `${b.family_user.first_name || ''} ${b.family_user.last_name || ''}`.trim() || '?'
  }
  return '?'
}

export function NannyBookingsPage() {
  const { data: bookingsData, isLoading, error } = useBookings()
  const updateStatus = useUpdateBookingStatus()
  const [updatingId, setUpdatingId] = useState<string | number | null>(null)

  const bookings = bookingsData?.results ?? []

  const handleAccept = (id: number) => {
    setUpdatingId(id)
    updateStatus.mutate(
      { id: String(id), status: 'accepted' },
      { onSettled: () => setUpdatingId(null) },
    )
  }

  const handleDecline = (id: number) => {
    setUpdatingId(id)
    updateStatus.mutate(
      { id: String(id), status: 'declined', reason: 'Declined by nanny' },
      { onSettled: () => setUpdatingId(null) },
    )
  }

  // Compute stats from real data
  const todayCount = bookings.filter((b) => {
    if (!b.start_date) return false
    return new Date(b.start_date).toDateString() === new Date().toDateString()
  }).length

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)
  const weekCount = bookings.filter((b) => {
    if (!b.start_date) return false
    const d = new Date(b.start_date)
    return d >= startOfWeek && d < endOfWeek
  }).length

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const monthHours = bookings
    .filter((b) => {
      const now = new Date()
      if (!b.start_date) return false
      const d = new Date(b.start_date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, b) => sum + (parseFloat(b.hours_per_week || '0')), 0)

  if (error) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Bookings</h1>
        <p className="mb-6 text-charcoal-muted">Manage your upcoming and past sessions</p>
        <div className="rounded-2xl border border-error-500/30 bg-error-50/30 p-8 text-center">
          <p className="text-error-700">Failed to load bookings. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Bookings</h1>
        <p className="mb-6 text-charcoal-muted">Manage your upcoming and past sessions</p>
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-4 shadow-card">
              <Skeleton className="mb-2" width={60} height={12} />
              <Skeleton className="mb-1" width={40} height={24} />
              <Skeleton width={50} height={12} />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <div className="flex items-center gap-4">
                <Skeleton width={48} height={48} rounded />
                <div className="flex-1">
                  <Skeleton className="mb-2" width={140} height={16} />
                  <Skeleton width={250} height={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-2">NANNIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Bookings</h1>
      <p className="mb-6 text-charcoal-muted">Manage your upcoming and past sessions</p>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Today', value: String(todayCount), sub: todayCount === 1 ? 'session' : 'sessions' },
          { label: 'This Week', value: String(weekCount), sub: weekCount === 1 ? 'session' : 'sessions' },
          { label: 'Pending', value: String(pendingCount), sub: 'to accept' },
          { label: 'Hours This Month', value: String(monthHours), sub: 'total' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-cream-300 bg-white p-4 shadow-card">
            <p className="text-xs text-charcoal-muted">{s.label}</p>
            <p className="mt-1 font-serif text-xl text-charcoal">{s.value}</p>
            <p className="text-xs text-charcoal-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-cream-300 bg-white p-12 shadow-card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-200">
            <Calendar className="h-7 w-7 text-charcoal-muted" />
          </div>
          <h3 className="mb-2 font-serif text-lg text-charcoal">No bookings yet</h3>
          <p className="text-sm text-charcoal-muted">When families book you, their requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const familyName = getFamilyName(b)
            return (
              <div key={b.id} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400/10 font-serif text-sm text-gold-600">
                    {familyName
                      .split(' ')
                      .map((w) => w.charAt(0))
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-charcoal">{familyName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-charcoal-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {b.start_date ? formatDate(b.start_date) : '--'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {formatTimeRange(b)}
                      </span>
                      <span>
                        {b.booking_type || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(b.id)}
                          disabled={updatingId === b.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50 text-success-700 hover:bg-success-500 hover:text-white disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDecline(b.id)}
                          disabled={updatingId === b.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-50 text-error-700 hover:bg-error-500 hover:text-white disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <span className={cn('pill-badge text-xs font-medium capitalize', statusStyles[b.status] || 'bg-cream-200 text-charcoal-muted')}>
                      {b.status}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NannyBookingsPage

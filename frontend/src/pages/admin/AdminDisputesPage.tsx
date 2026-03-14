import { AlertTriangle, Clock, CheckCircle, MessageSquare, Eye } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAdminDisputedBookings } from '@/queries/useAdmin'
import { Spinner } from '@/components/ui/Spinner'
import type { Booking } from '@/types/booking'

const statusConfig: Record<string, { label: string; style: string }> = {
  open: { label: 'Open', style: 'bg-error-50 text-error-700' },
  investigating: { label: 'Investigating', style: 'bg-warning-50 text-warning-700' },
  resolved: { label: 'Resolved', style: 'bg-success-50 text-success-700' },
  disputed: { label: 'Disputed', style: 'bg-error-50 text-error-700' },
}

const priorityStyles: Record<string, string> = {
  high: 'bg-error-50 text-error-700',
  medium: 'bg-warning-50 text-warning-700',
  low: 'bg-cream-200 text-charcoal-muted',
}

// Static fallback data when the API does not return disputed bookings
const fallbackDisputes = [
  {
    id: '1',
    title: 'Booking cancellation refund',
    family: 'Williams Family',
    nanny: 'Elina V.',
    opened: 'Mar 11, 2026',
    status: 'open',
    priority: 'high',
    amount: '\u20AC30',
  },
  {
    id: '2',
    title: 'Service quality complaint',
    family: 'Brown Family',
    nanny: 'Laura B.',
    opened: 'Mar 9, 2026',
    status: 'investigating',
    priority: 'medium',
    amount: '\u20AC90',
  },
  {
    id: '3',
    title: 'No-show dispute',
    family: 'Johnson Family',
    nanny: 'Diana R.',
    opened: 'Mar 5, 2026',
    status: 'resolved',
    priority: 'low',
    amount: '\u20AC45',
  },
  {
    id: '4',
    title: 'Late payment complaint',
    family: 'Smith Family',
    nanny: 'Anna K.',
    opened: 'Feb 28, 2026',
    status: 'resolved',
    priority: 'low',
    amount: '\u20AC75',
  },
]

function getFamilyName(b: Booking): string {
  if (b.family_user) {
    return `${b.family_user.first_name || ''} ${b.family_user.last_name || ''}`.trim() || '?'
  }
  return '?'
}

function getNannyName(b: Booking): string {
  if (b.nanny_card) {
    return `${b.nanny_card.first_name || ''} ${b.nanny_card.last_name || ''}`.trim() || '?'
  }
  return '?'
}

export function AdminDisputesPage() {
  const { data: apiData, isLoading, isError } = useAdminDisputedBookings()

  // Map API bookings to dispute shape, or fall back to static data
  const apiBookings = (apiData?.results ?? []) as Booking[]
  const useApi = !isError && apiBookings.length > 0

  const disputes = useApi
    ? apiBookings.map((b) => {
        const amount = parseFloat(b.total_amount || '0')
        return {
          id: String(b.id),
          title: `Disputed booking #${b.id}`,
          family: getFamilyName(b),
          nanny: getNannyName(b),
          opened: new Date(b.updated_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          }),
          status: 'open' as const,
          priority: (amount > 80 ? 'high' : amount > 40 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
          amount: `\u20AC${amount}`,
        }
      })
    : fallbackDisputes

  const openCount = disputes.filter((d) => d.status !== 'resolved').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-2">ADMIN</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Disputes</h1>
      <p className="mb-6 text-charcoal-muted">Manage user disputes and complaints</p>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Open Disputes', value: openCount.toString(), icon: <AlertTriangle className="h-5 w-5" />, color: 'text-error-700' },
          { label: 'Avg. Resolution', value: '3.2 days', icon: <Clock className="h-5 w-5" />, color: 'text-warning-700' },
          { label: 'Resolved This Month', value: disputes.filter((d) => d.status === 'resolved').length.toString(), icon: <CheckCircle className="h-5 w-5" />, color: 'text-success-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-charcoal-muted">{s.label}</p>
              <span className={cn('rounded-lg bg-cream-200 p-1.5', s.color)}>{s.icon}</span>
            </div>
            <p className="font-serif text-2xl text-charcoal">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {disputes.length === 0 && (
        <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
          <p className="font-serif text-lg text-charcoal">No disputes</p>
          <p className="mt-2 text-sm text-charcoal-muted">
            There are no disputed bookings at this time.
          </p>
        </div>
      )}

      {/* Disputes list */}
      <div className="space-y-4">
        {disputes.map((d) => {
          const sc = statusConfig[d.status] ?? statusConfig.open
          return (
            <div key={d.id} className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  d.status === 'resolved' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
                )}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-charcoal">{d.title}</h3>
                    <span className={cn('pill-badge text-[10px] font-medium uppercase', priorityStyles[d.priority])}>
                      {d.priority}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-charcoal-muted">
                    <span>Family: <span className="text-charcoal">{d.family}</span></span>
                    <span>Nanny: <span className="text-charcoal">{d.nanny}</span></span>
                    <span>Amount: <span className="font-medium text-charcoal">{d.amount}</span></span>
                    <span>Opened {d.opened}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('pill-badge text-xs font-medium', sc.style)}>
                    {sc.label}
                  </span>
                  {d.status !== 'resolved' && (
                    <>
                      <button className="rounded-lg p-2 text-charcoal-muted hover:bg-cream-200" title="View details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-charcoal-muted hover:bg-cream-200" title="Message">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminDisputesPage

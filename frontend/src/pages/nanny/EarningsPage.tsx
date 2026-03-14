import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DollarSign, TrendingUp, ArrowDownLeft, Calendar, CheckCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui'
import { useNannyEarnings, useNannyPayouts } from '@/queries/usePayments'
import { apiClient } from '@/lib/api/client'
const payoutStatusStyles: Record<string, string> = {
  completed: 'bg-success-50 text-success-700',
  pending: 'bg-warning-50 text-warning-700',
  processing: 'bg-gold-400/10 text-gold-600',
  failed: 'bg-error-50 text-error-700',
}

function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const symbols: Record<string, string> = { EUR: '\u20AC', USD: '$', QAR: 'QAR ' }
  const symbol = symbols[currency] || currency + ' '
  return `${symbol}${amount.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function EarningsPage() {
  const [searchParams] = useSearchParams()
  const [connectLoading, setConnectLoading] = useState(false)
  const connectSuccess = searchParams.get('connect') === 'success'

  const { data: earnings, isLoading: earningsLoading, error: earningsError } = useNannyEarnings()
  const { data: payoutsData, isLoading: payoutsLoading, error: payoutsError } = useNannyPayouts()

  const [connectError, setConnectError] = useState<string | null>(null)

  const handleSetupPayout = async () => {
    setConnectLoading(true)
    setConnectError(null)
    try {
      const { data } = await apiClient.post('payments/connect/onboard/')
      if (data.onboarding_url) {
        window.location.href = data.onboarding_url
      } else {
        setConnectLoading(false)
        setConnectError('No onboarding link received. Please try again.')
      }
    } catch (err: unknown) {
      setConnectLoading(false)
      const detail = (err as Record<string, unknown>)?.detail
      if (typeof detail === 'string' && detail.includes('signed up for Connect')) {
        setConnectError('Stripe Connect is not yet enabled. The platform admin needs to activate Connect in the Stripe Dashboard.')
      } else {
        setConnectError(typeof detail === 'string' ? detail : 'Failed to set up payout account. Please try again.')
      }
    }
  }

  const isLoading = earningsLoading || payoutsLoading
  const error = earningsError || payoutsError

  const payouts = payoutsData?.results ?? []
  const currency = earnings?.currency || 'EUR'

  if (error) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Earnings</h1>
        <p className="mb-6 text-charcoal-muted">Track your income and payouts</p>
        <div className="rounded-2xl border border-error-500/30 bg-error-50/30 p-8 text-center">
          <p className="text-error-700">Failed to load earnings data. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Earnings</h1>
        <p className="mb-6 text-charcoal-muted">Track your income and payouts</p>
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <Skeleton width={80} height={14} />
                <Skeleton width={32} height={32} />
              </div>
              <Skeleton width={100} height={28} />
            </div>
          ))}
        </div>
        <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <Skeleton className="mb-4" width={160} height={22} />
          <Skeleton height={192} />
        </div>
        <div className="rounded-2xl border border-cream-300 bg-white shadow-card">
          <div className="border-b border-cream-200 p-5">
            <Skeleton width={180} height={22} />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="flex-1" height={16} />
              <Skeleton width={60} height={20} />
              <Skeleton width={50} height={16} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'This Month', value: formatCurrency(earnings?.this_month ?? 0, currency), icon: <DollarSign className="h-5 w-5" />, color: 'text-gold-400' },
    { label: 'Pending', value: formatCurrency(earnings?.pending_amount ?? 0, currency), icon: <Calendar className="h-5 w-5" />, color: 'text-warning-700' },
    { label: 'Total Earned', value: formatCurrency(earnings?.total_earned ?? 0, currency), icon: <TrendingUp className="h-5 w-5" />, color: 'text-success-700' },
    { label: 'Payouts', value: String(payouts.length), icon: <ArrowDownLeft className="h-5 w-5" />, color: 'text-charcoal' },
  ]

  return (
    <div>
      <p className="section-label mb-2">NANNIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Earnings</h1>
      <p className="mb-6 text-charcoal-muted">Track your income and payouts</p>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-charcoal-muted">{s.label}</p>
              <span className={cn('rounded-lg bg-cream-200 p-1.5', s.color)}>{s.icon}</span>
            </div>
            <p className="font-serif text-2xl text-charcoal">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Earnings chart placeholder */}
      <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
        <h3 className="mb-4 font-serif text-lg text-charcoal">Monthly Earnings</h3>
        <div className="flex h-48 items-end justify-around gap-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => {
            // Simple bar chart - show current month progress
            const now = new Date()
            const currentMonthIdx = now.getMonth()
            const height = i <= currentMonthIdx && i <= 2 ? [60, 75, 85][i] || 0 : 0
            return (
              <div key={m} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all',
                    height > 0 ? 'bg-gold-400/20' : 'bg-cream-200'
                  )}
                  style={{ height: `${height || 10}%` }}
                />
                <span className="text-xs text-charcoal-muted">{m}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Connect success banner */}
      {connectSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-success-500/30 bg-success-50 p-4 text-sm text-success-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Payout account connected successfully! You can now receive payouts.
        </div>
      )}

      {/* Connect error banner */}
      {connectError && (
        <div className="mb-6 rounded-xl border border-error-500/30 bg-error-50/30 p-4 text-sm text-error-700">
          {connectError}
        </div>
      )}

      {/* Payout method */}
      <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">Payout Account</p>
              <p className="text-xs text-charcoal-muted">
                {payouts.length > 0 && payouts[0].paid_at
                  ? `Last payout: ${new Date(payouts[0].paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'Set up your bank account to receive payouts'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSetupPayout}
            disabled={connectLoading}
            className="flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-500 disabled:opacity-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {connectLoading ? 'Connecting...' : 'Set Up Payouts'}
          </button>
        </div>
      </div>

      {/* Transactions / Payouts */}
      <div className="rounded-2xl border border-cream-300 bg-white shadow-card">
        <div className="border-b border-cream-200 p-5">
          <h3 className="font-serif text-lg text-charcoal">Recent Payouts</h3>
        </div>
        {payouts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-charcoal-muted">No payouts yet. Complete bookings to start earning.</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">
                    Payout - Escrow #{p.escrow_payment ?? '?'}
                  </p>
                  <p className="text-xs text-charcoal-muted">
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={cn(
                  'pill-badge text-xs font-medium capitalize',
                  payoutStatusStyles[p.status] || 'bg-cream-200 text-charcoal-muted'
                )}>
                  {p.status}
                </span>
                <p className="text-sm font-semibold text-charcoal">
                  {formatCurrency(p.amount, p.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EarningsPage

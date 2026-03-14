import { useNavigate } from 'react-router-dom'
import { CreditCard, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/config/routes'
import { usePaymentHistory, useSubscription } from '@/queries/usePayments'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils/formatDate'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { CurrencyCode } from '@/lib/utils/formatCurrency'

export function PaymentsPage() {
  const navigate = useNavigate()
  const { data: paymentsData, isLoading: paymentsLoading, isError: paymentsError } = usePaymentHistory()
  const { data: subscription, isLoading: subLoading } = useSubscription()

  const payments = paymentsData?.results ?? []

  // Compute stats from real data
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const thisMonthTotal = payments
    .filter((p) => new Date(p.created_at) >= thisMonthStart && p.status !== 'refunded')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingTotal = payments
    .filter((p) => p.status === 'held')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalSpent = payments
    .filter((p) => p.status !== 'refunded')
    .reduce((sum, p) => sum + p.amount, 0)

  const currency: CurrencyCode = payments[0]?.currency ?? 'EUR'

  return (
    <div>
      <p className="section-label mb-2">FAMILIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Payments</h1>
      <p className="mb-6 text-charcoal-muted">Track payments and billing history</p>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {paymentsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <Skeleton width="40%" height={14} />
                <Skeleton width={32} height={32} />
              </div>
              <Skeleton width="50%" height={24} />
            </div>
          ))
        ) : (
          [
            { label: 'This Month', value: formatCurrency(thisMonthTotal, currency), icon: <DollarSign className="h-5 w-5" />, color: 'text-gold-400' },
            { label: 'Pending', value: formatCurrency(pendingTotal, currency), icon: <CreditCard className="h-5 w-5" />, color: 'text-warning-700' },
            { label: 'Total Spent', value: formatCurrency(totalSpent, currency), icon: <ArrowUpRight className="h-5 w-5" />, color: 'text-charcoal' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-charcoal-muted">{s.label}</p>
                <span className={cn('rounded-lg bg-cream-200 p-1.5', s.color)}>{s.icon}</span>
              </div>
              <p className="font-serif text-2xl text-charcoal">{s.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Subscription info */}
      <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
              <CreditCard className="h-5 w-5" />
            </div>
            {subLoading ? (
              <div className="space-y-1">
                <Skeleton width={140} height={14} />
                <Skeleton width={100} height={12} />
              </div>
            ) : subscription ? (
              <div>
                <p className="text-sm font-medium text-charcoal capitalize">
                  {subscription.plan} Plan
                </p>
                <p className="text-xs text-charcoal-muted">
                  {subscription.status === 'active'
                    ? `Renews ${formatDate(subscription.current_period_end)}`
                    : `Status: ${subscription.status}`}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-charcoal">No active subscription</p>
                <p className="text-xs text-charcoal-muted">Upgrade for premium features</p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate(ROUTES.FAMILY_SUBSCRIPTION)}
            className="text-sm text-gold-400 hover:text-gold-500"
          >
            Manage
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-cream-300 bg-white shadow-card">
        <div className="border-b border-cream-200 p-5">
          <h3 className="font-serif text-lg text-charcoal">Recent Transactions</h3>
        </div>

        {paymentsLoading ? (
          <div className="divide-y divide-cream-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton width={36} height={36} rounded />
                <div className="flex-1 space-y-1">
                  <Skeleton width="40%" height={14} />
                  <Skeleton width="20%" height={12} />
                </div>
                <Skeleton width={60} height={16} />
              </div>
            ))}
          </div>
        ) : paymentsError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-charcoal-muted">Could not load payment history.</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<CreditCard className="h-8 w-8" />}
              title="No transactions yet"
              description="Your payment history will appear here after your first booking."
            />
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {payments.map((t) => {
              const isRefund = t.status === 'refunded'
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    isRefund ? 'bg-success-50 text-success-700' : 'bg-cream-200 text-charcoal-muted'
                  )}>
                    {isRefund ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">
                      {isRefund ? 'Refund' : 'Payment'} - Booking #{t.booking ?? '?'}
                    </p>
                    <p className="text-xs text-charcoal-muted">{formatDate(t.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold', isRefund ? 'text-success-700' : 'text-charcoal')}>
                      {isRefund ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
                    </p>
                    <p className="text-xs capitalize text-charcoal-muted">{t.status}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentsPage

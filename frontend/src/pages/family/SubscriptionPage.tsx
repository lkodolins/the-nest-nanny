import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, CreditCard, Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSubscription, useCreateSubscription } from '@/queries/usePayments'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils/formatDate'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/config/queryKeys'

const plans = [
  {
    key: 'family_basic',
    name: 'Basic',
    price: 0,
    period: 'Free forever',
    features: ['Browse nanny profiles', 'Basic search filters', 'Up to 3 messages/month', 'Community support'],
  },
  {
    key: 'family_premium',
    name: 'Premium',
    price: 19,
    period: '/month',
    features: ['Unlimited messaging', 'Advanced filters', 'Priority booking', 'Verified badge', 'Contract templates', 'Phone support'],
    popular: true,
  },
  {
    key: 'family_elite',
    name: 'Family+',
    price: 39,
    period: '/month',
    features: ['Everything in Premium', 'Multiple caregiver profiles', 'Schedule management', 'Payment processing', 'Dedicated account manager', 'Emergency nanny service'],
  },
]

export function SubscriptionPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { data: subscription, isLoading: subLoading, isError } = useSubscription()
  const createSubscription = useCreateSubscription()

  const currentPlan = subscription?.plan ?? 'family_basic'
  const isActive = !subscription || subscription?.status === 'active' || subscription?.status === 'trialing'

  // Handle return from Stripe Checkout
  const success = searchParams.get('success')
  const cancelled = searchParams.get('cancelled')

  useEffect(() => {
    if (success) {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.subscription() })
      // Clean URL params after a moment
      const t = setTimeout(() => setSearchParams({}), 5000)
      return () => clearTimeout(t)
    }
  }, [success, queryClient, setSearchParams])

  const handleSelectPlan = (planKey: string) => {
    if (planKey === currentPlan) return
    createSubscription.mutate(planKey, {
      onSuccess: (data: Record<string, unknown>) => {
        // If backend returns a Stripe checkout URL, redirect to Stripe
        if (data && typeof data === 'object' && 'checkout_url' in data && data.checkout_url) {
          window.location.href = data.checkout_url as string
        }
        // For free plan downgrade, the mutation hook invalidates the query automatically
      },
    })
  }

  return (
    <div>
      <p className="section-label mb-2">FAMILIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Subscription</h1>
      <p className="mb-6 text-charcoal-muted">Manage your plan and billing</p>

      {/* Success / Cancel banners */}
      {success && (
        <div className="mb-6 rounded-xl border border-success-500/30 bg-success-50 p-4 text-sm text-success-700">
          Payment successful! Your subscription has been activated.
        </div>
      )}
      {cancelled && (
        <div className="mb-6 rounded-xl border border-warning-500/30 bg-warning-50 p-4 text-sm text-warning-700">
          Payment was cancelled. Your plan has not been changed.
        </div>
      )}

      {/* Current plan banner */}
      <div className="mb-8 rounded-2xl border border-gold-400/30 bg-gold-400/5 p-6">
        {subLoading ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton width={40} height={40} />
              <div className="space-y-1">
                <Skeleton width={120} height={16} />
                <Skeleton width={180} height={14} />
              </div>
            </div>
            <Skeleton width={80} height={28} />
          </div>
        ) : isError || !subscription ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-charcoal">Basic Plan</p>
                <p className="text-sm text-charcoal-muted">Free forever &mdash; upgrade for premium features</p>
              </div>
            </div>
            <p className="font-serif text-2xl text-charcoal">
              Free
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-charcoal capitalize">{subscription.plan.replace('family_', '')} Plan</p>
                <p className="text-sm text-charcoal-muted">
                  {isActive
                    ? subscription.current_period_end ? `Next billing date: ${formatDate(subscription.current_period_end)}` : 'Active'
                    : `Status: ${subscription.status.replace('_', ' ')}`}
                </p>
              </div>
            </div>
            {subscription.plan === 'family_premium' && (
              <p className="font-serif text-2xl text-charcoal">
                &euro;19<span className="text-sm font-normal text-charcoal-muted">/mo</span>
              </p>
            )}
            {subscription.plan === 'family_elite' && (
              <p className="font-serif text-2xl text-charcoal">
                &euro;39<span className="text-sm font-normal text-charcoal-muted">/mo</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Plans grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.key && isActive

          return (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl border bg-white p-6 shadow-card',
                isCurrent ? 'border-gold-400' : 'border-cream-300'
              )}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-3 py-1 text-xs font-medium text-white">
                  Current Plan
                </span>
              )}
              {plan.popular && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-charcoal px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </span>
              )}
              <h3 className="mb-1 font-serif text-xl text-charcoal">{plan.name}</h3>
              <p className="mb-4">
                <span className="font-serif text-3xl text-charcoal">
                  {plan.price === 0 ? 'Free' : `\u20AC${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-charcoal-muted">{plan.period}</span>
                )}
                {plan.price === 0 && (
                  <span className="ml-1 text-sm text-charcoal-muted">{plan.period}</span>
                )}
              </p>
              <ul className="mb-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-charcoal-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelectPlan(plan.key)}
                disabled={isCurrent || createSubscription.isPending}
                className={cn(
                  'w-full rounded-xl py-2.5 text-sm font-medium transition-colors',
                  isCurrent
                    ? 'border border-cream-300 bg-cream-100 text-charcoal-muted'
                    : 'bg-gold-400 text-white hover:bg-gold-500 disabled:opacity-50'
                )}
              >
                {isCurrent
                  ? 'Current Plan'
                  : createSubscription.isPending
                    ? 'Redirecting to payment...'
                    : plan.price === 0
                      ? 'Downgrade'
                      : 'Upgrade'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Payment method */}
      <div className="mt-8 rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
        <h3 className="mb-4 font-serif text-lg text-charcoal">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-200">
              <CreditCard className="h-5 w-5 text-charcoal-muted" />
            </div>
            {subLoading ? (
              <div className="space-y-1">
                <Skeleton width={140} height={14} />
                <Skeleton width={100} height={12} />
              </div>
            ) : subscription?.stripe_subscription_id ? (
              <div>
                <p className="text-sm font-medium text-charcoal">Payment method on file</p>
                <p className="text-xs text-charcoal-muted">Managed via Stripe</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-charcoal">No payment method</p>
                <p className="text-xs text-charcoal-muted">Add one when you upgrade to a paid plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage

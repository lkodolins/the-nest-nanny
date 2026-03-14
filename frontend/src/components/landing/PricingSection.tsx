import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils/cn'

interface PlanFeature {
  label: string
  included: boolean
}

interface Plan {
  label: string
  name: string
  price: string
  period: string
  description: string
  features: PlanFeature[]
  cta: string
  ctaHref: string
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    label: 'Families \u00B7 Basic',
    name: 'Basic',
    price: '\u20AC0',
    period: 'Free to browse & contact',
    description: 'Start exploring verified nanny profiles.',
    features: [
      { label: 'Browse all verified profiles', included: true },
      { label: 'View full nanny profiles', included: true },
      { label: 'Send 3 messages/month', included: true },
      { label: 'Basic search filters', included: true },
      { label: 'Unlimited messaging', included: false },
      { label: 'Video interviews', included: false },
      { label: 'Digital contracts & escrow', included: false },
    ],
    cta: 'GET STARTED FREE',
    ctaHref: ROUTES.REGISTER,
  },
  {
    label: 'Families \u00B7 Premium',
    name: 'Premium',
    price: '\u20AC29',
    period: 'per month',
    description: 'Everything you need to find and hire the perfect nanny.',
    features: [
      { label: 'Unlimited messaging', included: true },
      { label: 'Advanced filters & shortlisting', included: true },
      { label: 'In-platform video interviews', included: true },
      { label: 'Digital contracts & escrow payments', included: true },
      { label: 'Dedicated placement advisor', included: true },
      { label: 'Priority support', included: true },
      { label: 'Background check reports', included: true },
    ],
    cta: 'START PREMIUM',
    ctaHref: ROUTES.REGISTER,
    highlighted: true,
  },
  {
    label: 'Nannies',
    name: 'Nanny',
    price: '\u20AC9',
    period: 'per month \u00B7 or free with placement fee',
    description: 'Get discovered by premium families worldwide.',
    features: [
      { label: 'Verified profile listing', included: true },
      { label: 'Availability calendar', included: true },
      { label: 'Receive unlimited inquiries', included: true },
      { label: 'Payment protection via escrow', included: true },
      { label: 'Dispute resolution support', included: true },
    ],
    cta: 'JOIN AS NANNY',
    ctaHref: ROUTES.REGISTER,
  },
]

export function PricingSection() {
  return (
    <section className="bg-cream-100 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label mb-4">Pricing</p>
          <h2 className="font-serif text-4xl text-charcoal md:text-5xl">
            Transparent fees.
            <br />
            No surprises.
          </h2>
          <p className="mt-4 text-lg text-charcoal-muted">
            A simple structure for families and nannies alike.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl bg-white p-8 shadow-card',
                plan.highlighted && 'border-2 border-gold-400 shadow-card-hover'
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <p className="section-label text-xs">{plan.label}</p>

              <div className="mt-4">
                <span className="font-serif text-5xl text-charcoal">
                  {plan.price}
                </span>
              </div>
              <p className="mt-1 text-sm text-charcoal-muted">{plan.period}</p>

              <hr className="my-6" />

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-warm-300" />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        feature.included ? 'text-charcoal' : 'text-charcoal-muted'
                      )}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaHref}
                className={cn(
                  'mt-8 block rounded-full py-3 text-center text-sm font-semibold tracking-wide transition-all',
                  plan.highlighted
                    ? 'bg-gold-400 text-white hover:bg-gold-500'
                    : 'bg-cream-200 text-charcoal hover:bg-cream-300'
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingSection

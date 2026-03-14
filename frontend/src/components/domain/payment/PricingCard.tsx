import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PricingFeature {
  label: string
  included: boolean
}

interface PricingCardProps {
  label: string
  price: string
  period: string
  features: PricingFeature[]
  ctaLabel: string
  onCtaClick?: () => void
  highlighted?: boolean
  className?: string
}

export function PricingCard({
  label,
  price,
  period,
  features,
  ctaLabel,
  onCtaClick,
  highlighted = false,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl bg-white p-8 shadow-card',
        highlighted && 'border-2 border-gold-400 shadow-card-hover',
        className
      )}
    >
      {highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}

      <p className="section-label text-xs">{label}</p>

      <div className="mt-4">
        <span className="font-serif text-5xl text-charcoal">{price}</span>
      </div>
      <p className="mt-1 text-sm text-charcoal-muted">{period}</p>

      <hr className="my-6" />

      <ul className="space-y-3">
        {features.map((feature) => (
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

      <button
        onClick={onCtaClick}
        className={cn(
          'mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold tracking-wide transition-all',
          highlighted
            ? 'bg-gold-400 text-white hover:bg-gold-500'
            : 'bg-cream-200 text-charcoal hover:bg-cream-300'
        )}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

export default PricingCard

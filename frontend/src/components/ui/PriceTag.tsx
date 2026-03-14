import { cn } from '@/lib/utils/cn'

interface PriceTagProps {
  amount: number
  currency?: string
  period?: string
  className?: string
}

export function PriceTag({
  amount,
  currency = '\u20AC',
  period,
  className,
}: PriceTagProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-0.5', className)}>
      <span className="text-sm font-medium text-charcoal-muted">{currency}</span>
      <span className="font-serif text-2xl font-semibold text-charcoal">
        {amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      </span>
      {period && (
        <span className="text-sm text-charcoal-muted">{period}</span>
      )}
    </span>
  )
}

export default PriceTag

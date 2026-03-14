import { cn } from '@/lib/utils/cn'

type StarSize = 'sm' | 'md' | 'lg'

interface StarRatingProps {
  rating: number
  count?: number
  size?: StarSize
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

const sizeClasses: Record<StarSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

const countSizeClasses: Record<StarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

function StarIcon({
  filled,
  half,
  size,
  className,
}: {
  filled: boolean
  half: boolean
  size: StarSize
  className?: string
}) {
  const id = `half-${Math.random().toString(36).slice(2, 9)}`

  return (
    <svg
      viewBox="0 0 20 20"
      className={cn(sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {half && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" className="[stop-color:var(--color-gold-400)]" />
            <stop offset="50%" className="[stop-color:var(--color-warm-200)]" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        fill={half ? `url(#${id})` : filled ? 'var(--color-gold-400)' : 'var(--color-warm-200)'}
      />
    </svg>
  )
}

export function StarRating({
  rating,
  count,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1
    const filled = rating >= starValue
    const half = !filled && rating >= starValue - 0.5

    return (
      <span
        key={i}
        className={cn(interactive && 'cursor-pointer')}
        onClick={interactive && onChange ? () => onChange(starValue) : undefined}
        role={interactive ? 'button' : undefined}
        aria-label={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : undefined}
      >
        <StarIcon filled={filled} half={half} size={size} />
      </span>
    )
  })

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {stars}
      {count !== undefined && (
        <span className={cn('ml-1.5 text-charcoal-muted', countSizeClasses[size])}>
          ({count})
        </span>
      )}
    </div>
  )
}

export default StarRating

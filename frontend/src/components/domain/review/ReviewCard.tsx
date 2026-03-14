import { Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ReviewCardProps {
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  title: string
  content: string
  createdAt: string
  response?: string
  responseAt?: string
  nannyName?: string
}

export function ReviewCard({
  reviewerName,
  reviewerAvatar,
  rating,
  title,
  content,
  createdAt,
  response,
  responseAt,
  nannyName,
}: ReviewCardProps) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-cream-200">
            {reviewerAvatar ? (
              <img src={reviewerAvatar} alt={reviewerName} className="h-full w-full object-cover" />
            ) : (
              <span className="font-serif text-sm text-charcoal-muted">
                {reviewerName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-charcoal">{reviewerName}</h4>
            <p className="text-xs text-charcoal-muted">{formatDate(createdAt)}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-4 w-4',
                star <= rating
                  ? 'fill-gold-400 text-gold-400'
                  : 'fill-warm-200 text-warm-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        <h5 className="font-medium text-charcoal">{title}</h5>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">{content}</p>
      </div>

      {/* Nanny response */}
      {response && (
        <div className="mt-4 rounded-xl bg-cream-100 p-4">
          <p className="mb-1 text-xs font-medium text-gold-600">
            Response from {nannyName || 'Nanny'}
            {responseAt && ` \u00B7 ${formatDate(responseAt)}`}
          </p>
          <p className="text-sm leading-relaxed text-charcoal-muted">{response}</p>
        </div>
      )}
    </div>
  )
}

export default ReviewCard

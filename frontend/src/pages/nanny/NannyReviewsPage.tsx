import { useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useOwnNannyProfile } from '@/queries/useNannies'
import { useNannyReviews, useRespondToReview } from '@/queries/useReviews'
export function NannyReviewsPage() {
  const { data: profile } = useOwnNannyProfile()
  const nannyId = profile?.id ? String(profile.id) : ''
  const { data: reviewsData, isLoading, error } = useNannyReviews(nannyId)
  const respondToReview = useRespondToReview()

  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  const reviews = reviewsData?.results ?? []

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const handleSubmitReply = (reviewId: number) => {
    if (!replyText.trim()) return
    respondToReview.mutate(
      { id: reviewId, response: replyText.trim() },
      {
        onSuccess: () => {
          setReplyingTo(null)
          setReplyText('')
        },
      },
    )
  }

  if (error) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Reviews</h1>
        <p className="mb-6 text-charcoal-muted">Reviews from families you have worked with</p>
        <div className="rounded-2xl border border-error-500/30 bg-error-50/30 p-8 text-center">
          <p className="text-error-700">Failed to load reviews. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Reviews</h1>
        <p className="mb-6 text-charcoal-muted">Reviews from families you have worked with</p>
        <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Skeleton className="mx-auto mb-2" width={60} height={36} />
              <Skeleton className="mx-auto" width={100} height={16} />
            </div>
            <div className="flex-1 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={8} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <div className="mb-3 flex items-center gap-3">
                <Skeleton width={40} height={40} rounded />
                <div>
                  <Skeleton className="mb-1" width={120} height={16} />
                  <Skeleton width={80} height={12} />
                </div>
              </div>
              <Skeleton height={40} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Reviews</h1>
        <p className="mb-6 text-charcoal-muted">Reviews from families you have worked with</p>
        <div className="rounded-2xl border border-cream-300 bg-white p-12 shadow-card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-200">
            <Star className="h-7 w-7 text-charcoal-muted" />
          </div>
          <h3 className="mb-2 font-serif text-lg text-charcoal">No reviews yet</h3>
          <p className="text-sm text-charcoal-muted">
            After completing bookings, families can leave reviews about their experience.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-2">NANNIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Reviews</h1>
      <p className="mb-6 text-charcoal-muted">Reviews from families you have worked with</p>

      {/* Summary */}
      <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-serif text-3xl text-charcoal">{avgRating}</p>
            <div className="mt-1 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(Number(avgRating)) ? 'fill-gold-400 text-gold-400' : 'text-cream-300'
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-charcoal-muted">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-charcoal-muted">{star}</span>
                  <Star className="h-3 w-3 text-gold-400" />
                  <div className="h-2 flex-1 rounded-full bg-cream-200">
                    <div className="h-2 rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-charcoal-muted">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((r) => {
          const reviewerName = `${r.reviewer?.first_name || ''} ${r.reviewer?.last_name || ''}`.trim() || 'Anonymous'
          return (
          <div key={r.id} className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {r.reviewer?.avatar ? (
                  <img src={r.reviewer.avatar} alt={reviewerName} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/10 font-serif text-sm text-gold-600">
                    {reviewerName
                      .split(' ')
                      .map((w) => w.charAt(0))
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-charcoal">{reviewerName}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-gold-400 text-gold-400' : 'text-cream-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-charcoal-muted">
                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {r.title && <p className="mb-1 text-sm font-medium text-charcoal">{r.title}</p>}
            <p className="text-sm leading-relaxed text-charcoal-muted">{r.content}</p>

            {/* Nanny reply */}
            {r.response && (
              <div className="mt-4 rounded-xl bg-cream-50 p-4">
                <p className="mb-1 text-xs font-medium text-charcoal">Your response:</p>
                <p className="text-sm text-charcoal-muted">{r.response}</p>
                {r.response_at && (
                  <p className="mt-1 text-xs text-charcoal-muted">
                    {new Date(r.response_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {/* Reply form */}
            {!r.response && (
              <>
                {replyingTo === r.id ? (
                  <div className="mt-4 space-y-2">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response..."
                      className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 px-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitReply(r.id)}
                        disabled={!replyText.trim() || respondToReview.isPending}
                        className="rounded-lg bg-gold-400 px-4 py-2 text-xs font-medium text-white hover:bg-gold-500 disabled:opacity-50"
                      >
                        {respondToReview.isPending ? 'Sending...' : 'Submit Response'}
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText('') }}
                        className="rounded-lg border border-cream-300 px-4 py-2 text-xs font-medium text-charcoal hover:bg-cream-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(r.id)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold-600 hover:text-gold-500"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Respond to review
                  </button>
                )}
              </>
            )}
          </div>
          )
        })}
      </div>
    </div>
  )
}

export default NannyReviewsPage

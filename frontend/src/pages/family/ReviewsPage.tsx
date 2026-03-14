import { useState } from 'react'
import { Star } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '@/services/reviewService'
import { useBookings } from '@/queries/useBookings'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils/formatDate'
import type { Review } from '@/types/review'
import type { DRFPaginatedResponse } from '@/types/api'

function useMyReviews() {
  return useQuery({
    queryKey: ['reviews', 'my'],
    queryFn: (): Promise<DRFPaginatedResponse<Review>> =>
      reviewService.getMyReviews(),
  })
}

export function ReviewsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useMyReviews()
  const { data: bookingsData } = useBookings('completed')

  const reviews = data?.results ?? []
  const completedBookings = bookingsData?.results ?? []

  // Filter bookings that don't have reviews yet
  const reviewedBookingIds = new Set(reviews.map((r) => r.booking))
  const unreviewedBookings = completedBookings.filter((b) => !reviewedBookingIds.has(b.id))

  // Review form state
  const [showForm, setShowForm] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [formError, setFormError] = useState('')

  const createReview = useMutation({
    mutationFn: reviewService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['nannies'] })
      setShowForm(false)
      setSelectedBookingId(null)
      setRating(5)
      setTitle('')
      setContent('')
      setFormError('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setFormError(msg || 'Failed to submit review.')
    },
  })

  const handleSubmitReview = () => {
    if (!selectedBookingId) {
      setFormError('Please select a booking.')
      return
    }
    if (!content.trim()) {
      setFormError('Please write a review.')
      return
    }
    setFormError('')
    createReview.mutate({
      booking_id: selectedBookingId,
      rating,
      title: title.trim(),
      content: content.trim(),
    })
  }

  // Compute summary stats
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  return (
    <div>
      <p className="section-label mb-2">FAMILIES</p>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-heading-lg text-charcoal">My Reviews</h1>
          <p className="mt-1 text-charcoal-muted">Reviews you have left for nannies</p>
        </div>
        {unreviewedBookings.length > 0 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-gold-400 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500"
          >
            + Write Review
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gold-400/30 bg-gold-400/5 p-6 shadow-card">
          <h3 className="mb-4 font-serif text-lg text-charcoal">Write a Review</h3>

          {formError && (
            <div className="mb-3 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700">{formError}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Select booking</label>
              <select
                value={selectedBookingId ?? ''}
                onChange={(e) => setSelectedBookingId(Number(e.target.value) || null)}
                className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
              >
                <option value="">Choose a completed booking...</option>
                {unreviewedBookings.map((b) => {
                  const nannyName = b.nanny_card
                    ? `${b.nanny_card.first_name || ''} ${b.nanny_card.last_name || ''}`.trim()
                    : 'Nanny'
                  return (
                    <option key={b.id} value={b.id}>
                      {nannyName} - {formatDate(b.start_date)}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= rating ? 'fill-gold-400 text-gold-400' : 'text-cream-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Great experience!"
                className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Your review</label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience..."
                className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitReview}
                disabled={createReview.isPending}
                className="rounded-xl bg-gold-400 px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-500 disabled:opacity-50"
              >
                {createReview.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => { setShowForm(false); setFormError('') }}
                className="rounded-xl border border-cream-300 px-6 py-2.5 text-sm font-medium text-charcoal hover:bg-cream-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
        {isLoading ? (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Skeleton width={48} height={36} className="mx-auto mb-1" />
              <Skeleton width={80} height={16} className="mx-auto mb-1" />
              <Skeleton width={60} height={12} className="mx-auto" />
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <Skeleton width={12} height={14} />
                  <Skeleton width={12} height={12} />
                  <Skeleton width="100%" height={8} />
                  <Skeleton width={20} height={14} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-serif text-3xl text-charcoal">
                {avgRating > 0 ? avgRating.toFixed(1) : '--'}
              </p>
              <div className="mt-1 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-gold-400 text-gold-400' : 'text-cream-300'}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-charcoal-muted">{totalReviews} reviews given</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
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
        )}
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton width={40} height={40} rounded />
                  <div className="space-y-1">
                    <Skeleton width={100} height={14} />
                    <Skeleton width={60} height={12} />
                  </div>
                </div>
                <Skeleton width={80} height={12} />
              </div>
              <Skeleton width="100%" height={12} className="mb-1" />
              <Skeleton width="80%" height={12} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
          <p className="font-serif text-lg text-charcoal">Could not load reviews</p>
          <p className="mt-1 text-sm text-charcoal-muted">Please try again later.</p>
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="h-8 w-8" />}
          title="No reviews yet"
          description="After a completed booking, you can leave a review for your nanny."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gold-400/10 font-serif text-sm text-gold-600">
                    {r.reviewer?.avatar ? (
                      <img src={r.reviewer.avatar} alt={r.reviewer?.first_name} className="h-full w-full object-cover" />
                    ) : (
                      (r.reviewer?.first_name || '?').charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Booking #{r.booking}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < r.rating ? 'fill-gold-400 text-gold-400' : 'text-cream-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-charcoal-muted">{formatDate(r.created_at)}</span>
              </div>
              {r.title && (
                <p className="mb-1 text-sm font-medium text-charcoal">{r.title}</p>
              )}
              <p className="text-sm leading-relaxed text-charcoal-muted">{r.content}</p>
              {r.response && (
                <div className="mt-3 rounded-xl bg-cream-100 p-3">
                  <p className="text-xs font-medium text-gold-600">
                    Nanny response
                    {r.response_at && ` -- ${formatDate(r.response_at)}`}
                  </p>
                  <p className="mt-1 text-sm text-charcoal-muted">{r.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewsPage

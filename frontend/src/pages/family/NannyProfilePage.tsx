import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Star, Clock, Shield, Heart, MessageSquare, Calendar, X } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { useNannyProfile } from '@/queries/useNannies'
import { useNannyReviews } from '@/queries/useReviews'
import { useCreateBooking } from '@/queries/useBookings'
import { useAuth } from '@/lib/auth/useAuth'
import { messagingService } from '@/services/messagingService'
import { familyService } from '@/services/familyService'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDateLong } from '@/lib/utils/formatDate'
import { useQueryClient } from '@tanstack/react-query'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function NannyProfilePage() {
  const { nannyId } = useParams<{ nannyId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: nanny, isLoading, isError } = useNannyProfile(nannyId ?? '')
  const { data: reviewsData, isLoading: reviewsLoading } = useNannyReviews(nannyId ?? '')
  const createBooking = useCreateBooking()

  const reviews = reviewsData?.results ?? []

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingType, setBookingType] = useState('one_off')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [bookingError, setBookingError] = useState('')

  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  // Message state
  const [msgLoading, setMsgLoading] = useState(false)

  const handleBookNow = () => {
    setShowBookingForm(true)
    setBookingError('')
  }

  const handleSubmitBooking = () => {
    if (!nanny || !startDate) {
      setBookingError('Please select a start date.')
      return
    }
    setBookingError('')
    createBooking.mutate(
      {
        nanny_id: nanny.id,
        booking_type: bookingType,
        start_date: startDate,
        end_date: endDate || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        notes: bookingNotes || undefined,
      },
      {
        onSuccess: () => {
          setShowBookingForm(false)
          navigate(ROUTES.FAMILY_BOOKINGS)
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          setBookingError(msg || 'Failed to create booking. Please try again.')
        },
      },
    )
  }

  const handleSendMessage = async () => {
    if (!nanny || !user) return
    setMsgLoading(true)
    try {
      await messagingService.createConversation(Number(user.id), Number(nanny.user.id))
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      navigate(ROUTES.FAMILY_INBOX)
    } catch {
      alert('Could not start conversation. Please try again.')
    } finally {
      setMsgLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!nanny) return
    setFavLoading(true)
    try {
      if (isFavorited) {
        await familyService.removeFavorite(nanny.id)
        setIsFavorited(false)
      } else {
        await familyService.addFavorite(nanny.id)
        setIsFavorited(true)
      }
      queryClient.invalidateQueries({ queryKey: ['families'] })
    } catch {
      // silently fail
    } finally {
      setFavLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <p className="section-label mb-2">FAMILIES</p>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Skeleton width={200} height={28} className="mb-2" />
            <Skeleton width={140} height={16} />
          </div>
          <Skeleton width={100} height={16} />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <div className="flex items-start gap-5">
                <Skeleton width={80} height={80} rounded />
                <div className="flex-1 space-y-3">
                  <Skeleton width="50%" height={20} />
                  <Skeleton width="70%" height={14} />
                  <div className="flex gap-2">
                    <Skeleton width={80} height={24} />
                    <Skeleton width={80} height={24} />
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <Skeleton width={80} height={20} className="mb-3" />
              <Skeleton width="100%" height={14} className="mb-2" />
              <Skeleton width="90%" height={14} className="mb-2" />
              <Skeleton width="60%" height={14} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <Skeleton width="60%" height={28} className="mx-auto mb-2" />
              <Skeleton width="80%" height={14} className="mx-auto mb-5" />
              <Skeleton width="100%" height={44} className="mb-3" />
              <Skeleton width="100%" height={44} className="mb-3" />
              <Skeleton width="100%" height={44} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !nanny) {
    return (
      <div>
        <p className="section-label mb-2">FAMILIES</p>
        <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
          <p className="font-serif text-lg text-charcoal">Profile not found</p>
          <p className="mt-1 text-sm text-charcoal-muted">
            This nanny profile could not be loaded. It may have been removed.
          </p>
          <Link
            to={ROUTES.FAMILY_SEARCH}
            className="mt-4 inline-block text-sm text-gold-400 hover:text-gold-500"
          >
            &larr; Back to search
          </Link>
        </div>
      </div>
    )
  }

  const primaryPhoto = nanny.photos?.find((p) => p.is_primary)?.image ?? nanny.photos?.[0]?.image
  const initials = `${(nanny.user.first_name || '?').charAt(0)}${(nanny.user.last_name || '').charAt(0)}`

  // Group availability by day
  const slots = nanny.availability_slots ?? []
  const availabilityByDay = slots.reduce<Record<number, { start_time: string; end_time: string }[]>>(
    (acc, slot) => {
      if (!acc[slot.day_of_week]) acc[slot.day_of_week] = []
      acc[slot.day_of_week].push({ start_time: slot.start_time, end_time: slot.end_time })
      return acc
    },
    {},
  )

  return (
    <div>
      <p className="section-label mb-2">FAMILIES</p>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-heading-lg text-charcoal">
            Nanny Profile
          </h1>
          <p className="mt-1 text-sm text-charcoal-muted">
            {nanny.headline}
          </p>
        </div>
        <Link
          to={ROUTES.FAMILY_SEARCH}
          className="text-sm text-gold-400 hover:text-gold-500"
        >
          &larr; Back to search
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header card */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gold-400/10 font-serif text-2xl font-semibold text-gold-600">
                {primaryPhoto ? (
                  <img src={primaryPhoto} alt={nanny.user.first_name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl text-charcoal">
                    {nanny.user.first_name} {(nanny.user.last_name || '').charAt(0)}.
                  </h2>
                  {nanny.is_verified && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-500 text-xs text-white">
                      &#10003;
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-charcoal-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {nanny.city}, {nanny.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {nanny.years_experience} years exp.
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-gold-400" /> {parseFloat(nanny.rating_average || '0').toFixed(1)} ({nanny.review_count} reviews)
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {nanny.certifications.map((cert) => (
                    <span key={cert.id} className="pill-badge pill-gold">{cert.name}</span>
                  ))}
                  {nanny.languages.map((lang) => (
                    <span key={lang.code} className="pill-badge pill-cream">{lang.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-3 font-serif text-lg text-charcoal">About</h3>
            <p className="leading-relaxed text-charcoal-muted">
              {nanny.bio}
            </p>
          </div>

          {/* Specializations */}
          {nanny.specializations.length > 0 && (
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-serif text-lg text-charcoal">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {nanny.specializations.map((spec) => (
                  <span key={spec.id} className="pill-badge pill-cream capitalize">
                    {spec.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {nanny.certifications.length > 0 && (
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-serif text-lg text-charcoal">Certifications</h3>
              <div className="space-y-4">
                {nanny.certifications.map((cert) => (
                  <div key={cert.id} className="flex gap-4 border-b border-cream-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-200 text-charcoal-muted">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{cert.name}</p>
                      <p className="text-sm text-charcoal-muted">
                        {cert.issuing_body}
                        {cert.valid_from && ` -- ${formatDateLong(cert.valid_from)}`}
                      </p>
                      {cert.is_verified && (
                        <span className="mt-1 inline-block text-xs text-success-700">Verified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-serif text-lg text-charcoal">Reviews</h3>
            {reviewsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border-b border-cream-200 pb-4 last:border-0 last:pb-0">
                    <div className="mb-2 flex items-center gap-2">
                      <Skeleton width={32} height={32} rounded />
                      <div className="space-y-1">
                        <Skeleton width={80} height={14} />
                        <Skeleton width={60} height={10} />
                      </div>
                    </div>
                    <Skeleton width="100%" height={12} className="mb-1" />
                    <Skeleton width="70%" height={12} />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-charcoal-muted">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const reviewerName = `${review.reviewer?.first_name || ''} ${review.reviewer?.last_name || ''}`.trim() || 'Anonymous'
                  return (
                    <div key={review.id} className="border-b border-cream-200 pb-4 last:border-0 last:pb-0">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-cream-200 text-xs font-medium text-charcoal">
                          {review.reviewer?.avatar ? (
                            <img src={review.reviewer.avatar} alt={reviewerName} className="h-full w-full object-cover" />
                          ) : (
                            reviewerName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">{reviewerName}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className={`h-3 w-3 ${j < review.rating ? 'fill-gold-400 text-gold-400' : 'text-cream-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <p className="mb-1 text-sm font-medium text-charcoal">{review.title}</p>
                      )}
                      <p className="text-sm leading-relaxed text-charcoal-muted">
                        {review.content}
                      </p>
                      {review.response && (
                        <div className="mt-2 rounded-lg bg-cream-100 p-3">
                          <p className="text-xs font-medium text-gold-600">
                            Response from {nanny.user.first_name}
                          </p>
                          <p className="mt-1 text-sm text-charcoal-muted">{review.response}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking card */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <p className="mb-1 text-center text-2xl font-semibold text-charcoal">
              {formatCurrency(parseFloat(nanny.hourly_rate) || 0, nanny.currency)}
              <span className="text-base font-normal text-charcoal-muted">/hr</span>
            </p>
            <p className="mb-5 text-center text-sm text-charcoal-muted">
              {nanny.is_available ? 'Available for booking' : 'Currently unavailable'}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleBookNow}
                disabled={!nanny.is_available}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 py-3 font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
              >
                <Calendar className="h-4 w-4" />
                Book Now
              </button>
              <button
                onClick={handleSendMessage}
                disabled={msgLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cream-300 bg-white py-3 font-medium text-charcoal transition-colors hover:bg-cream-100 disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4" />
                {msgLoading ? 'Opening...' : 'Send Message'}
              </button>
              <button
                onClick={handleToggleFavorite}
                disabled={favLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cream-300 bg-white py-3 font-medium text-charcoal transition-colors hover:bg-cream-100 disabled:opacity-50"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-gold-400 text-gold-400' : ''}`} />
                {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            </div>
          </div>

          {/* Booking form modal */}
          {showBookingForm && (
            <div className="rounded-2xl border border-gold-400/30 bg-gold-400/5 p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-lg text-charcoal">Book {nanny.user.first_name}</h3>
                <button onClick={() => setShowBookingForm(false)} className="text-charcoal-muted hover:text-charcoal">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {bookingError && (
                <div className="mb-3 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700">{bookingError}</div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">Booking type</label>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
                  >
                    <option value="one_off">One-off session</option>
                    <option value="regular">Regular / Recurring</option>
                    <option value="live_in">Live-in</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
                  />
                </div>
                {bookingType !== 'one_off' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">Start time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">End time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">Notes (optional)</label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any special requirements..."
                    className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSubmitBooking}
                  disabled={createBooking.isPending || !startDate}
                  className="w-full rounded-xl bg-gold-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
                >
                  {createBooking.isPending ? 'Creating...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* Availability card */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-serif text-base text-charcoal">Availability</h3>
            <div className="space-y-2 text-sm">
              {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                const daySlots = availabilityByDay[dayIndex]
                return (
                  <div key={dayIndex} className="flex justify-between">
                    <span className="text-charcoal">{dayNames[dayIndex]}</span>
                    <span className="text-charcoal-muted">
                      {daySlots
                        ? daySlots.map((s) => `${s.start_time} - ${s.end_time}`).join(', ')
                        : 'Unavailable'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NannyProfilePage

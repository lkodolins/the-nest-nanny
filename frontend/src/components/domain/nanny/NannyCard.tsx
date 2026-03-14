import { Link } from 'react-router-dom'
import { Star, MapPin, CheckCircle, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NannyCardProps {
  id: number | string
  name: string
  avatar?: string
  city: string
  country?: string
  yearsExperience: number
  hourlyRate: number
  currency: string
  languages: string[]
  specializations: string[]
  ratingAverage: number
  reviewCount: number
  isVerified: boolean
  isFavorited?: boolean
  onToggleFavorite?: () => void
}

const currencySymbols: Record<string, string> = {
  EUR: '\u20AC',
  USD: '$',
  QAR: 'QAR ',
  GBP: '\u00A3',
}

export function NannyCard({
  id,
  name,
  avatar,
  city,
  yearsExperience,
  hourlyRate,
  currency,
  languages,
  specializations,
  ratingAverage,
  reviewCount,
  isVerified,
  isFavorited = false,
  onToggleFavorite,
}: NannyCardProps) {
  const symbol = currencySymbols[currency] || currency + ' '

  return (
    <div className="group relative rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover">
      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite()
          }}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorited
                ? 'fill-gold-400 text-gold-400'
                : 'text-charcoal-muted hover:text-gold-400'
            )}
          />
        </button>
      )}

      <Link to={`/family/nanny/${id}`}>
        {/* Avatar */}
        <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-cream-200">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-serif text-3xl text-charcoal-muted">
              {name.charAt(0)}
            </span>
          )}
        </div>

        {/* Name & verified badge */}
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-xl text-charcoal group-hover:text-gold-600 transition-colors">
            {name}
          </h3>
          {isVerified && (
            <CheckCircle className="h-4 w-4 text-success-500" />
          )}
        </div>

        {/* Experience & Location */}
        <p className="mt-1 flex items-center gap-1 text-sm text-charcoal-muted">
          <span>{yearsExperience} years experience</span>
          <span className="mx-1">&middot;</span>
          <MapPin className="h-3.5 w-3.5" />
          <span>{city}</span>
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {languages.map((lang) => (
            <span key={lang} className="pill-badge pill-gold text-xs">
              {lang}
            </span>
          ))}
          {specializations.map((spec) => (
            <span key={spec} className="pill-badge pill-cream text-xs">
              {spec}
            </span>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-4" />

        {/* Price & Rating */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-serif text-2xl text-charcoal">
              {symbol}{hourlyRate}
            </span>
            <span className="text-sm text-charcoal-muted">/hr</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-3.5 w-3.5',
                    star <= Math.round(ratingAverage)
                      ? 'fill-gold-400 text-gold-400'
                      : 'fill-warm-200 text-warm-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-charcoal-muted">
              {reviewCount} reviews
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default NannyCard

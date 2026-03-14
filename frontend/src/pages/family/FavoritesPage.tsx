import { Link } from 'react-router-dom'
import { Heart, Star, MapPin, Clock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { familyService } from '@/services/familyService'
import { Skeleton } from '@/components/ui/Skeleton'

export function FavoritesPage() {
  const queryClient = useQueryClient()

  const { data: favorites, isLoading, isError } = useQuery({
    queryKey: ['families', 'favorites'],
    queryFn: () => familyService.getFavorites(),
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: (nannyId: number) => familyService.removeFavorite(nannyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families', 'favorites'] })
    },
  })

  const nannyList = favorites ?? []

  return (
    <div>
      <p className="section-label mb-2">FAMILIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Favorites</h1>
      <p className="mb-6 text-charcoal-muted">Your saved nanny profiles</p>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton width={48} height={48} rounded />
                  <div className="space-y-1">
                    <Skeleton width={100} height={16} />
                    <Skeleton width={60} height={12} />
                  </div>
                </div>
                <Skeleton width={20} height={20} />
              </div>
              <Skeleton width="60%" height={12} className="mb-4" />
              <div className="flex justify-between">
                <Skeleton width={50} height={16} />
                <Skeleton width={80} height={28} />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
          <p className="font-serif text-lg text-charcoal">Could not load favorites</p>
          <p className="mt-1 text-sm text-charcoal-muted">Please try again later.</p>
        </div>
      ) : nannyList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-cream-300 bg-white p-16 shadow-card">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-200">
            <Heart className="h-7 w-7 text-charcoal-muted" />
          </div>
          <h3 className="mb-2 font-serif text-lg text-charcoal">No favorites yet</h3>
          <p className="text-sm text-charcoal-muted">
            Save nanny profiles to quickly find them later
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nannyList.map((fav) => {
            const nanny = fav.nanny
            const currencySymbol = nanny.currency === 'EUR' ? '\u20AC' : nanny.currency === 'USD' ? '$' : 'QAR '

            return (
              <div
                key={fav.id}
                className="group rounded-2xl border border-cream-300 bg-white p-5 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gold-400/10 font-serif text-sm font-semibold text-gold-600">
                      {nanny.avatar ? (
                        <img src={nanny.avatar} alt={nanny.first_name} className="h-full w-full object-cover" />
                      ) : (
                        `${(nanny.first_name || '?').charAt(0)}${(nanny.last_name || '').charAt(0)}`
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif text-base text-charcoal">
                        {nanny.first_name} {(nanny.last_name || '').charAt(0)}.
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-charcoal-muted">
                        <MapPin className="h-3 w-3" /> {nanny.city}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavoriteMutation.mutate(Number(nanny.id))}
                    disabled={removeFavoriteMutation.isPending}
                    className="text-gold-400 hover:text-gold-500 disabled:opacity-50"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                </div>
                <div className="mb-4 flex items-center gap-4 text-sm text-charcoal-muted">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-gold-400" />
                    <span className="font-medium text-charcoal">{parseFloat(nanny.rating_average || '0').toFixed(1)}</span> ({nanny.review_count})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {nanny.years_experience} years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-semibold text-charcoal">{currencySymbol}{nanny.hourly_rate}</span>
                    <span className="text-charcoal-muted">/hr</span>
                  </p>
                  <Link
                    to={`/family/nanny/${nanny.id}`}
                    className="rounded-lg bg-gold-400/10 px-3 py-1.5 text-xs font-medium text-gold-600 transition-colors hover:bg-gold-400/20"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage

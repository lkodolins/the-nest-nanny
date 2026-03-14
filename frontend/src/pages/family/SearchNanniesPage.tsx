import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin, Star, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useNannySearch } from '@/queries/useNannies'
import { useSearchFiltersStore } from '@/stores/searchFiltersStore'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export function SearchNanniesPage() {
  const [showFilters, setShowFilters] = useState(true)

  const {
    city,
    languages,
    specializations,
    minRate,
    maxRate,
    verifiedOnly,
    searchQuery,
    sortBy,
    setCity,
    toggleLanguage,
    toggleSpecialization,
    setMinRate,
    setMaxRate,
    setVerifiedOnly,
    setSearchQuery,
    setSortBy,
    clearFilters,
  } = useSearchFiltersStore()

  const filters = useMemo(
    () => ({
      ...(city ? { city } : {}),
      ...(languages.length ? { languages } : {}),
      ...(specializations.length ? { specializations } : {}),
      ...(minRate !== null ? { minRate } : {}),
      ...(maxRate !== null ? { maxRate } : {}),
      ...(verifiedOnly ? { isVerified: true } : {}),
      ...(searchQuery ? { query: searchQuery } : {}),
      ...(sortBy !== 'relevance' ? { sortBy: sortBy === 'price_low' ? 'rate_asc' : sortBy === 'price_high' ? 'rate_desc' : sortBy } : {}),
    }),
    [city, languages, specializations, minRate, maxRate, verifiedOnly, searchQuery, sortBy],
  )

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNannySearch(filters)

  const nannies = data?.pages.flatMap((page) => page.results) ?? []
  const totalCount = data?.pages[0]?.count ?? 0

  const sortOptions = [
    { value: 'relevance', label: 'Best match' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'price_low', label: 'Lowest price' },
    { value: 'price_high', label: 'Highest price' },
    { value: 'experience', label: 'Most experienced' },
  ]

  const locationOptions = ['All locations', 'Riga', 'Jurmala', 'Tallinn', 'Vilnius']
  const languageOptions = ['Latvian', 'English', 'Russian', 'Lithuanian', 'Estonian']
  const certOptions = ['First Aid', 'CPR', 'Early Childhood Ed.', 'Special Needs']

  return (
    <div>
      <div className="mb-6">
        <p className="section-label mb-2">FAMILIES</p>
        <h1 className="font-serif text-heading-lg text-charcoal">
          Find Your Nanny
        </h1>
        <p className="mt-1 text-charcoal-muted">
          Browse verified childcare professionals in your area
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, or specialization..."
            className="w-full rounded-xl border border-cream-300 bg-white py-3 pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
            showFilters
              ? 'border-gold-400 bg-gold-400/5 text-gold-600'
              : 'border-cream-300 bg-white text-charcoal hover:bg-cream-100'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar */}
        {showFilters && (
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-serif text-lg text-charcoal">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gold-400 hover:text-gold-500"
                >
                  Clear all
                </button>
              </div>

              {/* Location */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-charcoal">
                  Location
                </label>
                <select
                  value={city || 'All locations'}
                  onChange={(e) => setCity(e.target.value === 'All locations' ? '' : e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-charcoal focus:border-gold-400 focus:outline-none"
                >
                  {locationOptions.map((loc) => (
                    <option key={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Hourly rate */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-charcoal">
                  Hourly Rate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minRate ?? ''}
                    onChange={(e) => setMinRate(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-charcoal focus:border-gold-400 focus:outline-none"
                  />
                  <span className="text-charcoal-muted">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxRate ?? ''}
                    onChange={(e) => setMaxRate(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-charcoal focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-charcoal">
                  Availability
                </label>
                <div className="space-y-2">
                  {['Weekday mornings', 'Weekday afternoons', 'Evenings', 'Weekends', 'Overnight'].map(
                    (slot) => (
                      <label
                        key={slot}
                        className="flex items-center gap-2 text-sm text-charcoal-muted"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-cream-300 text-gold-400 focus:ring-gold-400/20"
                        />
                        {slot}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-charcoal">
                  Certifications
                </label>
                <div className="space-y-2">
                  {certOptions.map((cert) => (
                    <label
                      key={cert}
                      className="flex items-center gap-2 text-sm text-charcoal-muted"
                    >
                      <input
                        type="checkbox"
                        checked={specializations.includes(cert)}
                        onChange={() => toggleSpecialization(cert)}
                        className="h-4 w-4 rounded border-cream-300 text-gold-400 focus:ring-gold-400/20"
                      />
                      {cert}
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-charcoal">
                  Languages
                </label>
                <div className="space-y-2">
                  {languageOptions.map((lang) => (
                    <label
                      key={lang}
                      className="flex items-center gap-2 text-sm text-charcoal-muted"
                    >
                      <input
                        type="checkbox"
                        checked={languages.includes(lang)}
                        onChange={() => toggleLanguage(lang)}
                        className="h-4 w-4 rounded border-cream-300 text-gold-400 focus:ring-gold-400/20"
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>

              {/* Verified only */}
              <div>
                <label className="flex items-center gap-2 text-sm text-charcoal">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-cream-300 text-gold-400 focus:ring-gold-400/20"
                  />
                  <span className="font-medium">Verified only</span>
                </label>
              </div>

              <button
                onClick={() => {/* filters auto-apply via store */}}
                className="mt-6 w-full rounded-xl bg-gold-400 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500"
              >
                Apply Filters
              </button>
            </div>
          </aside>
        )}

        {/* Nanny cards grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-charcoal-muted">
              {isLoading ? (
                <Skeleton width={120} height={16} />
              ) : (
                <>
                  <span className="font-medium text-charcoal">{totalCount}</span> nannies found
                </>
              )}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-sm text-charcoal focus:border-gold-400 focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
                  <div className="mb-4 flex items-center gap-3">
                    <Skeleton width={48} height={48} rounded />
                    <div className="flex-1 space-y-2">
                      <Skeleton width="60%" height={16} />
                      <Skeleton width="40%" height={12} />
                    </div>
                  </div>
                  <Skeleton width="80%" height={12} className="mb-3" />
                  <Skeleton width="100%" height={1} className="my-4" />
                  <div className="flex justify-between">
                    <Skeleton width={60} height={20} />
                    <Skeleton width={80} height={28} />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
              <p className="font-serif text-lg text-charcoal">Something went wrong</p>
              <p className="mt-1 text-sm text-charcoal-muted">
                We could not load the nanny listings. Please try again later.
              </p>
            </div>
          ) : nannies.length === 0 ? (
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="No nannies found"
              description="Try adjusting your filters or search query to find more results."
              action={{ label: 'Clear Filters', onClick: clearFilters }}
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {nannies.map((nanny) => (
                  <Link
                    key={nanny.id}
                    to={`/family/nanny/${nanny.id}`}
                    className="group cursor-pointer rounded-2xl border border-cream-300 bg-white p-5 shadow-card transition-all hover:shadow-card-hover"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gold-400/10 font-serif text-sm font-semibold text-gold-600">
                        {nanny.avatar ? (
                          <img src={nanny.avatar} alt={nanny.first_name} className="h-full w-full object-cover" />
                        ) : (
                          `${(nanny.first_name || '?').charAt(0)}${(nanny.last_name || '').charAt(0)}`
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-base text-charcoal">
                            {nanny.first_name} {(nanny.last_name || '').charAt(0)}.
                          </h3>
                          {nanny.is_verified && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-500 text-[10px] text-white">
                              &#10003;
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-charcoal-muted">
                          <MapPin className="h-3 w-3" />
                          {nanny.city}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-4 text-sm text-charcoal-muted">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-gold-400" />
                        <span className="font-medium text-charcoal">
                          {parseFloat(nanny.rating_average || '0').toFixed(1)}
                        </span>
                        <span>({nanny.review_count})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {nanny.years_experience} years
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="font-semibold text-charcoal">
                          {nanny.currency === 'EUR' ? '\u20AC' : nanny.currency === 'USD' ? '$' : 'QAR '}{nanny.hourly_rate}
                        </span>
                        <span className="text-charcoal-muted">/hr</span>
                      </p>
                      <span className="rounded-lg bg-gold-400/10 px-3 py-1.5 text-xs font-medium text-gold-600 transition-colors group-hover:bg-gold-400/20">
                        View Profile
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {hasNextPage && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-xl border border-cream-300 bg-white px-6 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-cream-100 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchNanniesPage

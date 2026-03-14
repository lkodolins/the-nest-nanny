import { useState } from 'react'
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FilterState {
  city: string
  languages: string[]
  specializations: string[]
  minRate: string
  maxRate: string
  verifiedOnly: boolean
  searchQuery: string
}

const cities = ['All Cities', 'Marbella', 'Riga', 'Warsaw', 'Doha', 'Los Angeles']
const languageOptions = ['English', 'Spanish', 'Russian', 'Latvian', 'Polish', 'Arabic', 'French', 'German']
const specializationOptions = ['Newborns', 'Montessori', 'Special Needs', 'Luxury Families', 'Early Years', 'Multilingual']

interface NannySearchFiltersProps {
  onFilterChange?: (filters: FilterState) => void
  className?: string
}

export function NannySearchFilters({ onFilterChange, className }: NannySearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    city: 'All Cities',
    languages: [],
    specializations: [],
    minRate: '',
    maxRate: '',
    verifiedOnly: false,
    searchQuery: '',
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: unknown) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const toggleArrayFilter = (key: 'languages' | 'specializations', value: string) => {
    const current = filters[key]
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateFilter(key, updated)
  }

  const clearFilters = () => {
    const cleared: FilterState = {
      city: 'All Cities',
      languages: [],
      specializations: [],
      minRate: '',
      maxRate: '',
      verifiedOnly: false,
      searchQuery: '',
    }
    setFilters(cleared)
    onFilterChange?.(cleared)
  }

  const activeFilterCount =
    (filters.city !== 'All Cities' ? 1 : 0) +
    filters.languages.length +
    filters.specializations.length +
    (filters.minRate ? 1 : 0) +
    (filters.maxRate ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0)

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            placeholder="Search nannies..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-muted focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
          <MapPin className="h-3.5 w-3.5" />
          Location
        </h4>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => updateFilter('city', city)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                filters.city === city
                  ? 'bg-gold-400 text-white'
                  : 'bg-cream-200 text-charcoal-muted hover:bg-cream-300'
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
          Languages
        </h4>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleArrayFilter('languages', lang)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                filters.languages.includes(lang)
                  ? 'bg-gold-400/10 text-gold-600 ring-1 ring-gold-400'
                  : 'bg-cream-200 text-charcoal-muted hover:bg-cream-300'
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Specializations */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
          Specializations
        </h4>
        <div className="flex flex-wrap gap-2">
          {specializationOptions.map((spec) => (
            <button
              key={spec}
              onClick={() => toggleArrayFilter('specializations', spec)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                filters.specializations.includes(spec)
                  ? 'bg-gold-400/10 text-gold-600 ring-1 ring-gold-400'
                  : 'bg-cream-200 text-charcoal-muted hover:bg-cream-300'
              )}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
          Hourly Rate
        </h4>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minRate}
            onChange={(e) => updateFilter('minRate', e.target.value)}
            className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
          <span className="text-sm text-charcoal-muted">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxRate}
            onChange={(e) => updateFilter('maxRate', e.target.value)}
            className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
        </div>
      </div>

      {/* Verified only */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
            className="h-4 w-4 rounded border-cream-300 text-gold-400 focus:ring-gold-400"
          />
          <span className="text-sm text-charcoal">Verified nannies only</span>
        </label>
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-gold-400 hover:text-gold-600"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile filter button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg text-charcoal">Filters</h3>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5 text-charcoal-muted" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn('hidden lg:block', className)}>
        <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-card">
          <h3 className="mb-6 font-serif text-lg text-charcoal">Filters</h3>
          {filterContent}
        </div>
      </div>
    </>
  )
}

export default NannySearchFilters

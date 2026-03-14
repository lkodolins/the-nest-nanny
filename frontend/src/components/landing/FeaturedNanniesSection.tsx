import { Link } from 'react-router-dom'
import { Star, MapPin } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const featuredNannies = [
  {
    id: 1,
    name: 'Maria Gonzalez',
    initial: 'M',
    experience: '12 years experience',
    city: 'Marbella',
    languages: ['Spanish / English'],
    specializations: ['Newborns', 'Montessori'],
    rate: 22,
    currency: 'EUR',
    symbol: '\u20AC',
    rating: 5.0,
    reviewCount: 48,
    verified: true,
  },
  {
    id: 2,
    name: 'Anna Petrova',
    initial: 'A',
    experience: '7 years experience',
    city: 'Riga',
    languages: ['Latvian / Russian / EN'],
    specializations: ['Special Needs'],
    rate: 14,
    currency: 'EUR',
    symbol: '\u20AC',
    rating: 5.0,
    reviewCount: 31,
    verified: true,
  },
  {
    id: 3,
    name: 'Fatima Al-Rashid',
    initial: 'F',
    experience: '9 years experience',
    city: 'Doha',
    languages: ['Arabic / English'],
    specializations: ['Luxury Families'],
    rate: 45,
    currency: 'QAR',
    symbol: 'QAR',
    rating: 5.0,
    reviewCount: 27,
    verified: true,
  },
]

export function FeaturedNanniesSection() {
  return (
    <section className="bg-cream-100 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="section-label mb-4">Our Nannies</p>
            <h2 className="font-serif text-4xl text-charcoal md:text-5xl">
              Featured profiles
            </h2>
          </div>
          <Link
            to={ROUTES.FAMILY_SEARCH}
            className="hidden rounded-full border border-charcoal px-6 py-2.5 text-sm font-medium text-charcoal transition-all hover:border-gold-400 hover:text-gold-600 md:inline-block"
          >
            VIEW ALL
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredNannies.map((nanny) => (
            <Link
              key={nanny.id}
              to={`/family/nanny/${nanny.id}`}
              className="group rounded-2xl bg-white p-6 shadow-card transition-all hover:shadow-card-hover"
            >
              {/* Avatar */}
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream-200">
                <span className="font-serif text-2xl text-charcoal-muted">
                  {nanny.initial}
                </span>
              </div>

              {/* Name & details */}
              <h3 className="font-serif text-xl text-charcoal group-hover:text-gold-600">
                {nanny.name}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-charcoal-muted">
                {nanny.experience}
                <span className="mx-1">&middot;</span>
                <MapPin className="h-3.5 w-3.5" />
                {nanny.city}
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[...nanny.languages, ...nanny.specializations].map((tag) => (
                  <span
                    key={tag}
                    className="pill-badge pill-cream text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <hr className="my-4" />

              {/* Price & Rating */}
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl text-charcoal">
                  {nanny.symbol === 'QAR' ? 'QAR ' : nanny.symbol}
                  {nanny.rate}
                  <span className="text-sm font-sans text-charcoal-muted">/hr</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-gold-400 text-gold-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-charcoal-muted">
                    {nanny.reviewCount} reviews
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to={ROUTES.FAMILY_SEARCH}
            className="inline-block rounded-full border border-charcoal px-6 py-2.5 text-sm font-medium text-charcoal"
          >
            VIEW ALL
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedNanniesSection

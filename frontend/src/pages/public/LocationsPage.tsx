import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const locations = [
  { city: 'Riga', country: 'Latvia', nannies: 124, available: true },
  { city: 'Tallinn', country: 'Estonia', nannies: 87, available: true },
  { city: 'Vilnius', country: 'Lithuania', nannies: 96, available: true },
  { city: 'Jurmala', country: 'Latvia', nannies: 34, available: true },
  { city: 'Tartu', country: 'Estonia', nannies: 28, available: true },
  { city: 'Kaunas', country: 'Lithuania', nannies: 41, available: true },
  { city: 'Liepaja', country: 'Latvia', nannies: 18, available: false },
  { city: 'Parnu', country: 'Estonia', nannies: 15, available: false },
]

export function LocationsPage() {
  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="px-6 pb-16 pt-24 text-center">
        <p className="section-label mb-4">LOCATIONS</p>
        <h1 className="section-heading mx-auto max-w-2xl">
          Find nannies near you
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal-muted">
          The Nest Nanny is growing across the Baltics. Find trusted childcare
          professionals in your city.
        </p>
      </section>

      {/* Locations grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div
              key={loc.city}
              className="group rounded-2xl border border-cream-300 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-charcoal">
                    {loc.city}
                  </h3>
                  <p className="text-sm text-charcoal-muted">{loc.country}</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-charcoal-muted">
                <span className="font-semibold text-charcoal">
                  {loc.nannies}
                </span>{' '}
                verified nannies
              </p>
              {loc.available ? (
                <span className="pill-badge pill-gold">Available</span>
              ) : (
                <span className="pill-badge pill-cream">Coming Soon</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-cream-300 bg-white px-6 py-20 text-center">
        <h2 className="font-serif text-heading-lg text-charcoal">
          Don't see your city?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-charcoal-muted">
          We are expanding quickly. Sign up and we will notify you when we
          launch in your area.
        </p>
        <Link
          to={ROUTES.REGISTER}
          className="mt-8 inline-block rounded-xl bg-gold-400 px-8 py-3 font-medium text-white transition-colors hover:bg-gold-500"
        >
          Join the Waitlist
        </Link>
      </section>
    </div>
  )
}

export default LocationsPage

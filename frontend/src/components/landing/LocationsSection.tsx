import { ArrowRight } from 'lucide-react'

const cities = [
  { name: 'Marbella', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
  { name: 'Riga', flag: '\uD83C\uDDF1\uD83C\uDDFB' },
  { name: 'Warsaw', flag: '\uD83C\uDDF5\uD83C\uDDF1' },
  { name: 'Doha', flag: '\uD83C\uDDF6\uD83C\uDDE6' },
  { name: 'Los Angeles', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
]

export function LocationsSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label mb-4">Where We Operate</p>
          <h2 className="font-serif text-4xl text-charcoal md:text-5xl">
            Built for premium
            <br />
            markets worldwide
          </h2>
          <p className="mt-4 text-lg text-charcoal-muted">
            Launching across five key cities, with expansion to follow The Nest Club footprint.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          {cities.map((city) => (
            <button
              key={city.name}
              className="group flex items-center gap-3 rounded-full border border-cream-300 bg-white px-6 py-3 transition-all hover:border-gold-400 hover:shadow-md"
            >
              <span className="text-xl">{city.flag}</span>
              <span className="text-sm font-medium text-charcoal group-hover:text-gold-600">
                {city.name}
              </span>
              <ArrowRight className="h-4 w-4 text-charcoal-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-400" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LocationsSection

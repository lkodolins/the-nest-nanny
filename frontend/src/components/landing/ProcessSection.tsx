import { Search, MessageCircle, Handshake } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Search & Filter',
    description:
      'Browse verified profiles by location, language, age specialisation, certifications, and availability. Every nanny shown has passed our verification process.',
    icon: <Search className="h-8 w-8" />,
  },
  {
    number: '02',
    title: 'Connect & Interview',
    description:
      'Message directly through the platform. Schedule a video or in-person interview. Review work history, references, and certifications — all in one profile.',
    icon: <MessageCircle className="h-8 w-8" />,
  },
  {
    number: '03',
    title: 'Book & Pay Securely',
    description:
      'Agree on terms, sign a digital contract, and pay through escrow. Structured for one-off bookings, regular placements, or live-in arrangements.',
    icon: <Handshake className="h-8 w-8" />,
  },
]

export function ProcessSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label mb-4">Process</p>
          <h2 className="font-serif text-4xl text-charcoal md:text-5xl">
            Simple for families.
            <br />
            Fair for nannies.
          </h2>
          <p className="mt-4 text-lg text-charcoal-muted">
            Everything from first search to first day, managed in one place.
          </p>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-3 lg:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center lg:text-left">
              {/* Step number */}
              <span className="font-serif text-7xl font-light text-cream-300">
                {step.number}
              </span>

              <div className="mt-4">
                <div className="mb-4 inline-flex rounded-2xl bg-gold-400/10 p-3 text-gold-400">
                  {step.icon}
                </div>
                <h3 className="mb-3 font-serif text-2xl text-charcoal">
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-charcoal-muted">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProcessSection

import { Link } from 'react-router-dom'
import { Search, MessageSquare, Calendar, Shield } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const steps = [
  {
    icon: <Search className="h-8 w-8" />,
    title: 'Search & Filter',
    description:
      'Browse verified nannies in your area. Filter by experience, availability, languages, certifications, and more.',
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: 'Connect & Interview',
    description:
      'Send messages, schedule video calls, and get to know potential nannies before making your decision.',
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: 'Book & Manage',
    description:
      'Book sessions with ease. Manage your schedule, track hours, and handle payments all in one place.',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Trust & Safety',
    description:
      'Every nanny undergoes thorough background checks, identity verification, and reference validation.',
  },
]

export function HowItWorksPage() {
  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="px-6 pb-16 pt-24 text-center">
        <p className="section-label mb-4">HOW IT WORKS</p>
        <h1 className="section-heading mx-auto max-w-2xl">
          Finding trusted childcare, simplified
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal-muted">
          The Nest Nanny connects families with vetted, professional nannies
          through a seamless four-step process.
        </p>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-cream-300 bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                {step.icon}
              </div>
              <span className="mb-2 block text-sm font-semibold text-gold-400">
                Step {i + 1}
              </span>
              <h3 className="mb-3 font-serif text-xl text-charcoal">
                {step.title}
              </h3>
              <p className="leading-relaxed text-charcoal-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-cream-300 bg-white px-6 py-20 text-center">
        <h2 className="font-serif text-heading-lg text-charcoal">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-charcoal-muted">
          Join thousands of families who trust The Nest Nanny for quality
          childcare.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to={ROUTES.REGISTER}
            className="rounded-xl bg-gold-400 px-8 py-3 font-medium text-white transition-colors hover:bg-gold-500"
          >
            Create Account
          </Link>
          <Link
            to={ROUTES.PRICING}
            className="rounded-xl border border-cream-300 bg-white px-8 py-3 font-medium text-charcoal transition-colors hover:bg-cream-200"
          >
            View Pricing
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HowItWorksPage

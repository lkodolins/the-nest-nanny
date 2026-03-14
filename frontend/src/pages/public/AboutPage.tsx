import { Link } from 'react-router-dom'
import { Heart, Shield, Users, Award } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const values = [
  {
    icon: <Shield className="h-7 w-7" />,
    title: 'Safety First',
    description:
      'Every nanny on our platform undergoes rigorous background checks and identity verification.',
  },
  {
    icon: <Heart className="h-7 w-7" />,
    title: 'Quality Care',
    description:
      'We partner with experienced, passionate childcare professionals who love what they do.',
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: 'Community',
    description:
      'We build lasting relationships between families and nannies based on trust and respect.',
  },
  {
    icon: <Award className="h-7 w-7" />,
    title: 'Excellence',
    description:
      'We continually raise the bar for childcare standards through training and support.',
  },
]

export function AboutPage() {
  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="px-6 pb-16 pt-24 text-center">
        <p className="section-label mb-4">ABOUT US</p>
        <h1 className="section-heading mx-auto max-w-3xl">
          Reimagining how families find childcare
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-charcoal-muted">
          The Nest Nanny was founded with a simple belief: every family
          deserves access to trusted, professional childcare. We are building
          the platform that makes that possible -- connecting families with
          verified nannies through technology, transparency, and care.
        </p>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="rounded-2xl border border-cream-300 bg-white p-10 shadow-card">
          <h2 className="mb-4 font-serif text-heading text-charcoal">
            Our Mission
          </h2>
          <p className="text-lg leading-relaxed text-charcoal-muted">
            To create the most trusted childcare marketplace in the Baltics and
            beyond, where every family can find the right nanny with confidence,
            and every nanny can build a rewarding career doing what they love.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-10 text-center font-serif text-heading-lg text-charcoal">
          Our Values
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-cream-300 bg-white p-8 shadow-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                {v.icon}
              </div>
              <h3 className="mb-2 font-serif text-lg text-charcoal">
                {v.title}
              </h3>
              <p className="leading-relaxed text-charcoal-muted">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-cream-300 bg-white px-6 py-20 text-center">
        <h2 className="font-serif text-heading-lg text-charcoal">
          Join our growing community
        </h2>
        <p className="mx-auto mt-4 max-w-md text-charcoal-muted">
          Whether you are a family looking for care or a nanny looking for
          families, we would love to have you.
        </p>
        <Link
          to={ROUTES.REGISTER}
          className="mt-8 inline-block rounded-xl bg-gold-400 px-8 py-3 font-medium text-white transition-colors hover:bg-gold-500"
        >
          Get Started
        </Link>
      </section>
    </div>
  )
}

export default AboutPage

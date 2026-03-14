import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { Shield, Award, Heart, Star, FileCheck } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-cream-100 pb-20 pt-32 lg:pb-32 lg:pt-44">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gold-400/5" />
        <div className="absolute -bottom-32 -left-20 h-[500px] w-[500px] rounded-full bg-gold-400/5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cream-300 bg-white/80 px-4 py-2 text-sm text-charcoal-muted backdrop-blur-sm">
            <Shield className="h-4 w-4 text-gold-400" />
            <span>Every nanny verified. Every family protected.</span>
          </div>

          {/* Main heading */}
          <h1 className="font-serif text-5xl leading-tight tracking-tight text-charcoal md:text-6xl lg:text-7xl">
            Premium childcare,{' '}
            <span className="text-gold-400">verified</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-charcoal-muted md:text-xl">
            The Nest Nanny connects discerning families with thoroughly vetted,
            exceptional nannies across Marbella, Riga, Warsaw, Doha, and Los Angeles.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to={ROUTES.FAMILY_SEARCH}
              className="rounded-full bg-gold-400 px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-gold-400/20 transition-all hover:bg-gold-500 hover:shadow-xl hover:shadow-gold-400/30"
            >
              Find Your Nanny
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-full border border-cream-300 bg-white px-8 py-3.5 text-base font-medium text-charcoal transition-all hover:border-gold-400 hover:text-gold-600"
            >
              Join as Nanny
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Our Standards
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: <Shield className="h-5 w-5" />, label: 'Criminal Background Check' },
              { icon: <FileCheck className="h-5 w-5" />, label: 'Reference Verification' },
              { icon: <Award className="h-5 w-5" />, label: 'ID Authentication' },
              { icon: <Heart className="h-5 w-5" />, label: 'First Aid Certified' },
              { icon: <Star className="h-5 w-5" />, label: 'In-person Interview' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 text-sm text-charcoal-muted"
              >
                <span className="text-gold-400">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

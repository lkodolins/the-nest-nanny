import { PricingSection } from '@/components/landing/PricingSection'

export function PricingPage() {
  return (
    <div className="bg-cream-50">
      <section className="px-6 pb-8 pt-24 text-center">
        <p className="section-label mb-4">PRICING</p>
        <h1 className="section-heading mx-auto max-w-2xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal-muted">
          Choose the plan that fits your family. No hidden fees, cancel
          anytime.
        </p>
      </section>
      <PricingSection />
    </div>
  )
}

export default PricingPage

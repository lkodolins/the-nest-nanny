import { HeroSection } from '@/components/landing/HeroSection'
import { ProcessSection } from '@/components/landing/ProcessSection'
import { FeaturedNanniesSection } from '@/components/landing/FeaturedNanniesSection'
import { TrustSafetySection } from '@/components/landing/TrustSafetySection'
import { PricingSection } from '@/components/landing/PricingSection'
import { LocationsSection } from '@/components/landing/LocationsSection'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ProcessSection />
      <FeaturedNanniesSection />
      <TrustSafetySection />
      <PricingSection />
      <LocationsSection />
    </>
  )
}

export default HomePage

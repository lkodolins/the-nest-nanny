import { CheckCircle, Shield, Users, Award } from 'lucide-react'

const verificationSteps = [
  {
    number: '01',
    title: 'Identity Verification',
    description:
      'Government-issued ID authenticated via our digital verification partner. Biometric face match included for all new applicants.',
    icon: <Shield className="h-6 w-6" />,
  },
  {
    number: '02',
    title: 'Criminal Background Check',
    description:
      'Full national criminal records check, run by certified third-party providers in each country. Annual renewal required.',
    icon: <CheckCircle className="h-6 w-6" />,
  },
  {
    number: '03',
    title: 'Reference Screening',
    description:
      'Minimum three verified employer references, contacted directly by our team. Longform interviews, not checkbox forms.',
    icon: <Users className="h-6 w-6" />,
  },
  {
    number: '04',
    title: 'Certifications & Training',
    description:
      'First aid, CPR, and childcare qualifications validated against issuing bodies. Specialisation badges (newborn, SEN, multilingual) separately verified.',
    icon: <Award className="h-6 w-6" />,
  },
]

const sampleVerification = [
  { label: 'Identity Verified', detail: 'Passport \u00B7 Biometric match' },
  { label: 'Background Clear', detail: 'Spain national check \u00B7 Feb 2025' },
  { label: '3 References Confirmed', detail: 'All contacted \u00B7 Longform interviews' },
  { label: 'First Aid Certified', detail: 'Red Cross \u00B7 Valid to Dec 2026' },
  { label: 'Montessori Badge', detail: 'AMI certified \u00B7 Level 2' },
]

export function TrustSafetySection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left - Steps */}
          <div>
            <p className="section-label mb-4">Trust & Safety</p>
            <h2 className="font-serif text-4xl text-charcoal md:text-5xl">
              Verification that
              <br />
              actually means something
            </h2>

            <div className="mt-12 space-y-0">
              {verificationSteps.map((step, i) => (
                <div
                  key={step.number}
                  className={`border-t border-cream-300 py-8 ${
                    i === verificationSteps.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="flex gap-5">
                    <span className="text-sm font-semibold text-gold-400">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl text-charcoal">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Sample verification card */}
          <div className="flex items-center">
            <div className="w-full rounded-2xl bg-cream-50 p-8 shadow-card">
              {/* Profile header */}
              <div className="mb-6">
                <h3 className="font-serif text-2xl text-charcoal">
                  Sofia Andersen
                </h3>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Verification completed 14 Feb 2025
                </p>
              </div>

              {/* Verification items */}
              <div className="space-y-3">
                {sampleVerification.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-500" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        {item.label}
                      </p>
                      <p className="text-xs text-charcoal-muted">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustSafetySection

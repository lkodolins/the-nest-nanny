import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

const familyLinks = [
  { label: 'Find a Nanny', href: ROUTES.FAMILY_SEARCH },
  { label: 'How It Works', href: ROUTES.HOW_IT_WORKS },
  { label: 'Pricing', href: ROUTES.PRICING },
  { label: 'Safety', href: ROUTES.ABOUT },
]

const nannyLinks = [
  { label: 'Join the Platform', href: ROUTES.REGISTER },
  { label: 'Verification Process', href: ROUTES.ABOUT },
  { label: 'Nanny Resources', href: ROUTES.HOW_IT_WORKS },
  { label: 'Community', href: ROUTES.ABOUT },
]

const companyLinks = [
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Locations', href: ROUTES.LOCATIONS },
  { label: 'The Nest Club', href: ROUTES.ABOUT },
  { label: 'Contact', href: ROUTES.ABOUT },
]

export function Footer() {
  return (
    <footer className="border-t border-cream-300 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to={ROUTES.HOME} className="inline-block">
              <span className="font-serif text-xl text-charcoal">
                The Nest{' '}
              </span>
              <span className="font-serif text-xl text-gold-400">Nanny</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-charcoal-muted">
              Premium childcare, verified. Part of The Nest family of brands.
            </p>
          </div>

          {/* Families */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Families
            </h4>
            <ul className="mt-4 space-y-3">
              {familyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-charcoal-muted transition-colors hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nannies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Nannies
            </h4>
            <ul className="mt-4 space-y-3">
              {nannyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-charcoal-muted transition-colors hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Company
            </h4>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-charcoal-muted transition-colors hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-cream-300 pt-8 md:flex-row">
          <p className="text-sm text-charcoal-muted">
            &copy; {new Date().getFullYear()} The Nest Nanny. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-charcoal-muted hover:text-charcoal">
              Privacy
            </Link>
            <Link to="#" className="text-sm text-charcoal-muted hover:text-charcoal">
              Terms
            </Link>
            <Link to="#" className="text-sm text-charcoal-muted hover:text-charcoal">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

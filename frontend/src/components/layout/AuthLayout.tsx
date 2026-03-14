import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to={ROUTES.HOME}>
            <span className="font-serif text-3xl text-charcoal">The Nest </span>
            <span className="font-serif text-3xl text-gold-400">Nanny</span>
          </Link>
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white p-8 shadow-card">
          <Outlet />
        </div>

        {/* Back link */}
        <p className="mt-6 text-center text-sm text-charcoal-muted">
          <Link to={ROUTES.HOME} className="hover:text-gold-400">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthLayout

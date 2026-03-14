import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-100 px-6 text-center">
      <p className="section-label mb-4">404</p>
      <h1 className="font-serif text-display text-charcoal">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-charcoal-muted">
        Sorry, we couldn't find the page you're looking for. It may have been
        moved or no longer exists.
      </p>
      <Link
        to={ROUTES.HOME}
        className="mt-8 inline-block rounded-xl bg-gold-400 px-8 py-3 font-medium text-white transition-colors hover:bg-gold-500"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default NotFoundPage

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

/* ─── Types ─────────────────────────────────────────────── */

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/* ─── Shared Error UI ───────────────────────────────────── */

function ErrorFallback({
  error,
  onReset,
}: {
  error?: Error | null
  onReset?: () => void
}) {
  const isDev = import.meta.env.DEV

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
      <div className="w-full max-w-lg animate-fade-in text-center">
        {/* Decorative icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold-400/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gold-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-heading-lg text-charcoal mb-3">
          Something went wrong
        </h1>

        {/* Body */}
        <p className="mx-auto mb-8 max-w-sm font-sans text-base leading-relaxed text-charcoal-muted">
          We&rsquo;re sorry for the inconvenience. Please try again or return to
          the home page.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => {
              onReset?.()
              window.location.reload()
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-8 py-3 text-sm font-medium text-charcoal shadow-sm transition-all duration-200 hover:bg-gold-500 active:bg-gold-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
          >
            Try Again
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-400 bg-transparent px-8 py-3 text-sm font-medium text-gold-600 transition-all duration-200 hover:bg-gold-400/10 active:bg-gold-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
          >
            Back to Home
          </Link>
        </div>

        {/* Dev-only error details */}
        {isDev && error && (
          <details className="mt-10 rounded-xl border border-cream-300 bg-cream-100 text-left">
            <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-charcoal-light select-none">
              Error details (development only)
            </summary>
            <div className="border-t border-cream-300 px-5 py-4">
              <p className="mb-2 text-sm font-semibold text-error-700">
                {error.message}
              </p>
              {error.stack && (
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-cream-200 p-4 font-mono text-xs text-charcoal-light">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

/* ─── ErrorBoundary (class component) ───────────────────── */

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />
    }
    return this.props.children
  }
}

/* ─── RouteErrorPage (for React Router errorElement) ───── */

export function RouteErrorPage() {
  const routeError = useRouteError()

  let error: Error | null = null

  if (routeError instanceof Error) {
    error = routeError
  } else if (isRouteErrorResponse(routeError)) {
    error = new Error(`${routeError.status} ${routeError.statusText}`)
  } else if (typeof routeError === 'string') {
    error = new Error(routeError)
  } else {
    error = new Error('An unexpected error occurred')
  }

  return <ErrorFallback error={error} />
}

export default ErrorBoundary

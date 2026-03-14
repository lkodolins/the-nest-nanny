import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/lib/auth/useAuth'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'

type RoleTab = 'family' | 'nanny'

export function LoginPage() {
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<RoleTab>('family')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password, role)
      navigate(role === 'family' ? ROUTES.FAMILY_SEARCH : ROUTES.NANNY_DASHBOARD)
    } catch {
      // error is set in auth context
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-center font-serif text-2xl text-charcoal">
        Welcome back
      </h1>
      <p className="mb-8 text-center text-sm text-charcoal-muted">
        Sign in to your account
      </p>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={clearError} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Role tabs */}
      <div className="mb-6 flex rounded-xl bg-cream-200 p-1">
        {(['family', 'nanny'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setRole(tab)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
              role === tab
                ? 'bg-white text-charcoal shadow-card'
                : 'text-charcoal-muted hover:text-charcoal'
            )}
          >
            {tab === 'family' ? 'Family' : 'Nanny'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-charcoal"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 py-3 pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-charcoal"
            >
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-gold-400 hover:text-gold-500"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 py-3 pl-10 pr-12 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-cream-300 text-gold-400 focus:ring-gold-400/20"
          />
          <label htmlFor="remember" className="text-sm text-charcoal-muted">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gold-400 py-3 font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-60"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1" />
        <span className="text-xs text-charcoal-muted">or</span>
        <hr className="flex-1" />
      </div>

      {/* Google login */}
      <GoogleLoginButton
        text="continue_with"
        onSuccess={async (credential) => {
          try {
            await loginWithGoogle(credential, role)
            navigate(role === 'family' ? ROUTES.FAMILY_SEARCH : ROUTES.NANNY_DASHBOARD)
          } catch {
            // error handled in auth context
          }
        }}
      />

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-charcoal-muted">
        Don't have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-gold-400 hover:text-gold-500"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}

export default LoginPage

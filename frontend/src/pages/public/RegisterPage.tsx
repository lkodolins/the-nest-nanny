import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, Home, Baby, MapPin } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { SUPPORTED_CITIES } from '@/config/constants'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/lib/auth/useAuth'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'

type Role = 'family' | 'nanny'
type Step = 'role' | 'form'

export function RegisterPage() {
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<Role>('family')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'riga',
    agreeTerms: false,
  })

  const updateField = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (form.password !== form.confirmPassword) {
      return
    }

    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        role,
        city: role === 'nanny' ? form.city : undefined,
      })
      navigate(role === 'family' ? ROUTES.FAMILY_SEARCH : ROUTES.NANNY_DASHBOARD)
    } catch {
      // error is set in auth context
    }
  }

  // ── Step 1: Role Selection ──────────────────────────────
  if (step === 'role') {
    return (
      <div>
        <h1 className="mb-2 text-center font-serif text-2xl text-charcoal">
          Join The Nest Nanny
        </h1>
        <p className="mb-8 text-center text-sm text-charcoal-muted">
          Choose how you'd like to use our platform
        </p>

        <div className="space-y-4">
          {/* Family card */}
          <button
            type="button"
            onClick={() => {
              setRole('family')
              setStep('form')
            }}
            className={cn(
              'group w-full rounded-2xl border-2 p-6 text-left transition-all hover:border-gold-400 hover:shadow-card',
              role === 'family'
                ? 'border-gold-400 bg-gold-400/5'
                : 'border-cream-300 bg-white'
            )}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-serif text-lg text-charcoal">
              I'm a Family
            </h3>
            <p className="text-sm leading-relaxed text-charcoal-muted">
              Find trusted, verified nannies for your children. Browse profiles,
              book sessions, and manage everything in one place.
            </p>
          </button>

          {/* Nanny card */}
          <button
            type="button"
            onClick={() => {
              setRole('nanny')
              setStep('form')
            }}
            className={cn(
              'group w-full rounded-2xl border-2 p-6 text-left transition-all hover:border-gold-400 hover:shadow-card',
              role === 'nanny'
                ? 'border-gold-400 bg-gold-400/5'
                : 'border-cream-300 bg-white'
            )}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
              <Baby className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-serif text-lg text-charcoal">
              I'm a Nanny
            </h3>
            <p className="text-sm leading-relaxed text-charcoal-muted">
              Build your profile, get verified, connect with families, and grow
              your childcare career with flexible scheduling.
            </p>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-charcoal-muted">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-gold-400 hover:text-gold-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  // ── Step 2: Registration Form ───────────────────────────
  return (
    <div>
      <button
        type="button"
        onClick={() => setStep('role')}
        className="mb-4 text-sm text-charcoal-muted hover:text-gold-400"
      >
        &larr; Back to role selection
      </button>

      <h1 className="mb-2 text-center font-serif text-2xl text-charcoal">
        Create your {role === 'family' ? 'Family' : 'Nanny'} account
      </h1>
      <p className="mb-8 text-center text-sm text-charcoal-muted">
        Fill in your details to get started
      </p>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={clearError} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Password mismatch warning */}
      {form.confirmPassword && form.password !== form.confirmPassword && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Passwords do not match
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1.5 block text-sm font-medium text-charcoal"
            >
              First name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
              <input
                id="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="Jane"
                className="w-full rounded-xl border border-cream-300 bg-cream-50 py-3 pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block text-sm font-medium text-charcoal"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Smith"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 py-3 px-4 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="regEmail"
            className="mb-1.5 block text-sm font-medium text-charcoal"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
            <input
              id="regEmail"
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 py-3 pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-charcoal"
          >
            Phone number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+371 20 000 000"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 py-3 pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            />
          </div>
        </div>

        {/* City (nanny only) */}
        {role === 'nanny' && (
          <div>
            <label
              htmlFor="city"
              className="mb-1.5 block text-sm font-medium text-charcoal"
            >
              Your city
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
              <select
                id="city"
                required
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full appearance-none rounded-xl border border-cream-300 bg-cream-50 py-3 pl-10 pr-4 text-sm text-charcoal focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              >
                {SUPPORTED_CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.flag} {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label
            htmlFor="regPassword"
            className="mb-1.5 block text-sm font-medium text-charcoal"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
            <input
              id="regPassword"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Min 8 characters"
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

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-charcoal"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 py-3 pl-10 pr-4 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            />
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            required
            checked={form.agreeTerms}
            onChange={(e) => updateField('agreeTerms', e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-cream-300 text-gold-400 focus:ring-gold-400/20"
          />
          <label htmlFor="terms" className="text-sm text-charcoal-muted">
            I agree to the{' '}
            <a href="#" className="text-gold-400 hover:text-gold-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-gold-400 hover:text-gold-500">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || form.password !== form.confirmPassword}
          className="w-full rounded-xl bg-gold-400 py-3 font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1" />
        <span className="text-xs text-charcoal-muted">or</span>
        <hr className="flex-1" />
      </div>

      {/* Google signup */}
      <GoogleLoginButton
        text="signup_with"
        onSuccess={async (credential) => {
          try {
            await loginWithGoogle(credential, role)
            navigate(role === 'family' ? ROUTES.FAMILY_SEARCH : ROUTES.NANNY_DASHBOARD)
          } catch {
            // error handled in auth context
          }
        }}
      />

      <p className="mt-6 text-center text-sm text-charcoal-muted">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-gold-400 hover:text-gold-500"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage

import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/lib/auth/useAuth'
import type { UserRole } from '@/types/user'

const navLinks = [
  { label: 'Find a Nanny', href: ROUTES.FAMILY_SEARCH },
  { label: 'How It Works', href: ROUTES.HOW_IT_WORKS },
  { label: 'Pricing', href: ROUTES.PRICING },
  { label: 'Safety', href: ROUTES.ABOUT },
]

const dashboardByRole: Record<UserRole, string> = {
  family: ROUTES.FAMILY_DASHBOARD,
  nanny: ROUTES.NANNY_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const isHome = location.pathname === '/'

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    await logout()
    navigate(ROUTES.HOME)
  }

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || !isHome || isMobileOpen
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-1">
          <span className="font-serif text-2xl tracking-tight text-charcoal">
            The Nest{' '}
          </span>
          <span className="font-serif text-2xl tracking-tight text-gold-400">
            Nanny
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-gold-400',
                location.pathname === link.href
                  ? 'text-gold-400'
                  : 'text-charcoal-light'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated && user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-cream-300 px-3 py-1.5 text-sm font-medium text-charcoal transition-colors hover:bg-cream-100"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400/10 font-serif text-xs text-gold-600">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
                )}
                <span className="max-w-[120px] truncate">{user.first_name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-charcoal-muted" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-cream-300 bg-white py-2 shadow-lg">
                  <div className="border-b border-cream-200 px-4 py-2">
                    <p className="truncate text-sm font-medium text-charcoal">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="truncate text-xs text-charcoal-muted">{user.email}</p>
                  </div>
                  <Link
                    to={dashboardByRole[user.role]}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-light transition-colors hover:bg-cream-100 hover:text-charcoal"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-charcoal-light transition-colors hover:bg-cream-100 hover:text-charcoal"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="text-sm font-medium text-charcoal-light transition-colors hover:text-charcoal"
              >
                Log in
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="rounded-full bg-gold-400 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gold-500 hover:shadow-md"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <X className="h-6 w-6 text-charcoal" />
          ) : (
            <Menu className="h-6 w-6 text-charcoal" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="border-t border-cream-300 bg-white px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-base font-medium text-charcoal-light transition-colors hover:text-gold-400"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-cream-300" />
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 py-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400/10 font-serif text-xs text-gold-600">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-charcoal-muted">{user.email}</p>
                  </div>
                </div>
                <Link
                  to={dashboardByRole[user.role]}
                  className="flex items-center gap-2 text-base font-medium text-charcoal-light"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-base font-medium text-charcoal-light"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-base font-medium text-charcoal-light"
                >
                  Log in
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="rounded-full bg-gold-400 px-6 py-3 text-center text-base font-medium text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar

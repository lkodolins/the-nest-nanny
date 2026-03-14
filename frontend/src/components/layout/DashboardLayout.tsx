import { useState, useCallback, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Search, MessageSquare, Calendar, FileText, CreditCard,
  Heart, User, Settings, Star, Shield, DollarSign, BarChart3,
  Users, CheckCircle, AlertTriangle, Menu, X, Bell, LogOut,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/lib/auth/useAuth'
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/queries/useNotifications'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const familyNav: NavItem[] = [
  { label: 'Find Nannies', href: ROUTES.FAMILY_SEARCH, icon: <Search className="h-5 w-5" /> },
  { label: 'Messages', href: ROUTES.FAMILY_INBOX, icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Bookings', href: ROUTES.FAMILY_BOOKINGS, icon: <Calendar className="h-5 w-5" /> },
  { label: 'Contracts', href: ROUTES.FAMILY_CONTRACTS, icon: <FileText className="h-5 w-5" /> },
  { label: 'Payments', href: ROUTES.FAMILY_PAYMENTS, icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Favorites', href: ROUTES.FAMILY_FAVORITES, icon: <Heart className="h-5 w-5" /> },
  { label: 'Reviews', href: ROUTES.FAMILY_REVIEWS, icon: <Star className="h-5 w-5" /> },
  { label: 'Profile', href: ROUTES.FAMILY_PROFILE, icon: <User className="h-5 w-5" /> },
  { label: 'Subscription', href: ROUTES.FAMILY_SUBSCRIPTION, icon: <CreditCard className="h-5 w-5" /> },
]

const nannyNav: NavItem[] = [
  { label: 'My Profile', href: ROUTES.NANNY_PROFILE_EDITOR, icon: <User className="h-5 w-5" /> },
  { label: 'Availability', href: ROUTES.NANNY_AVAILABILITY, icon: <Calendar className="h-5 w-5" /> },
  { label: 'Verification', href: ROUTES.NANNY_VERIFICATION, icon: <Shield className="h-5 w-5" /> },
  { label: 'Messages', href: ROUTES.NANNY_INBOX, icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Bookings', href: ROUTES.NANNY_BOOKINGS, icon: <Calendar className="h-5 w-5" /> },
  { label: 'Earnings', href: ROUTES.NANNY_EARNINGS, icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Reviews', href: ROUTES.NANNY_REVIEWS, icon: <Star className="h-5 w-5" /> },
  { label: 'Settings', href: ROUTES.NANNY_SETTINGS, icon: <Settings className="h-5 w-5" /> },
]

const adminNav: NavItem[] = [
  { label: 'Analytics', href: ROUTES.ADMIN_ANALYTICS, icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Users', href: ROUTES.ADMIN_USERS, icon: <Users className="h-5 w-5" /> },
  { label: 'Verifications', href: ROUTES.ADMIN_VERIFICATION_QUEUE, icon: <CheckCircle className="h-5 w-5" /> },
  { label: 'Disputes', href: ROUTES.ADMIN_DISPUTES, icon: <AlertTriangle className="h-5 w-5" /> },
]

function NotificationBell() {
  const { data: notifications } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllRead()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications?.filter(n => !n.is_read) ?? []
  const items = notifications?.slice(0, 10) ?? []

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative flex items-center gap-4">
      <button onClick={() => setOpen(!open)} className="relative rounded-lg p-2 text-charcoal-muted hover:bg-cream-200">
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-white">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-cream-300 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
            <h4 className="font-serif text-sm text-charcoal">Notifications</h4>
            {unread.length > 0 && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-gold-400 hover:text-gold-500">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-charcoal-muted">No notifications yet</p>
            ) : (
              items.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markRead.mutate(n.id)
                    if (n.link) window.location.href = n.link
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-cream-100',
                    !n.is_read && 'bg-gold-400/5'
                  )}
                >
                  <span className="text-sm font-medium text-charcoal">{n.title}</span>
                  <span className="line-clamp-2 text-xs text-charcoal-muted">{n.message}</span>
                  <span className="text-[10px] text-charcoal-muted/60">
                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface DashboardLayoutProps {
  role: 'family' | 'nanny' | 'admin'
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = useCallback(async () => {
    await logout()
    navigate(ROUTES.HOME)
  }, [logout, navigate])

  // ProtectedRoute already handles the auth/role check, but just in case:
  if (!user) return null

  const navItems = role === 'family' ? familyNav : role === 'nanny' ? nannyNav : adminNav

  return (
    <div className="flex min-h-screen bg-cream-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-cream-300 bg-white transition-all duration-300 lg:relative lg:z-auto',
          sidebarCollapsed ? 'w-20' : 'w-72',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-cream-300 px-4">
          {!sidebarCollapsed && (
            <Link to={ROUTES.HOME} className="flex items-center">
              <span className="font-serif text-lg text-charcoal">The Nest </span>
              <span className="font-serif text-lg text-gold-400">Nanny</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-lg p-1.5 text-charcoal-muted hover:bg-cream-200 lg:block"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                location.pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-gold-400/10 text-gold-600'
                        : 'text-charcoal-muted hover:bg-cream-200 hover:text-charcoal'
                    )}
                  >
                    <span className={cn(isActive && 'text-gold-400')}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-cream-300 p-3">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/10 font-serif text-sm text-gold-600">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-charcoal">
                  {user.first_name} {user.last_name}
                </p>
                <p className="truncate text-xs text-charcoal-muted">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-charcoal-muted hover:bg-cream-200 hover:text-charcoal"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="mx-auto flex items-center justify-center rounded-lg p-2 text-charcoal-muted hover:bg-cream-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-cream-300 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-charcoal-muted hover:bg-cream-200 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

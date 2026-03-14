import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth/useAuth'
import { ROUTES } from '@/config/routes'
import type { UserRole } from '@/types/user'

interface ProtectedRouteProps {
  /** The content to render when access is granted */
  children: React.ReactNode
  /** If provided, user.role must match one of these roles */
  role?: UserRole | UserRole[]
}

/**
 * Wraps children and enforces authentication (and optionally role).
 *
 * - While the auth state is loading, shows a centered spinner.
 * - If not authenticated, redirects to /login (preserving the intended URL).
 * - If authenticated but wrong role, redirects to the user's own dashboard.
 */
export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cream-300 border-t-gold-400" />
          <p className="text-sm text-charcoal-muted">Loading...</p>
        </div>
      </div>
    )
  }

  // ── Not authenticated ──────────────────────────────────
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // ── Role check ─────────────────────────────────────────
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role]
    if (!allowedRoles.includes(user.role)) {
      // Redirect to the user's own dashboard
      const dashboardByRole: Record<UserRole, string> = {
        family: ROUTES.FAMILY_DASHBOARD,
        nanny: ROUTES.NANNY_DASHBOARD,
        admin: ROUTES.ADMIN_DASHBOARD,
      }
      return <Navigate to={dashboardByRole[user.role]} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

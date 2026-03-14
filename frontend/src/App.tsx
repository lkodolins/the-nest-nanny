import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth/authContext'
import { ErrorBoundary, RouteErrorPage } from '@/components/ErrorBoundary'

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Public pages
import { HomePage } from '@/pages/public/HomePage'
import { HowItWorksPage } from '@/pages/public/HowItWorksPage'
import { PricingPage } from '@/pages/public/PricingPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { LocationsPage } from '@/pages/public/LocationsPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'

// Auth pages
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'

// Family pages
import { SearchNanniesPage } from '@/pages/family/SearchNanniesPage'
import { NannyProfilePage } from '@/pages/family/NannyProfilePage'
import { InboxPage } from '@/pages/family/InboxPage'
import { BookingsPage } from '@/pages/family/BookingsPage'
import { ContractsPage } from '@/pages/family/ContractsPage'
import { PaymentsPage } from '@/pages/family/PaymentsPage'
import { FavoritesPage } from '@/pages/family/FavoritesPage'
import { ReviewsPage } from '@/pages/family/ReviewsPage'
import { FamilyProfilePage } from '@/pages/family/FamilyProfilePage'
import { SubscriptionPage } from '@/pages/family/SubscriptionPage'

// Nanny pages
import { NannyProfileEditorPage } from '@/pages/nanny/NannyProfileEditorPage'
import { AvailabilityPage } from '@/pages/nanny/AvailabilityPage'
import { VerificationPage } from '@/pages/nanny/VerificationPage'
import { NannyInboxPage } from '@/pages/nanny/NannyInboxPage'
import { NannyBookingsPage } from '@/pages/nanny/NannyBookingsPage'
import { EarningsPage } from '@/pages/nanny/EarningsPage'
import { NannyReviewsPage } from '@/pages/nanny/NannyReviewsPage'
import { NannySettingsPage } from '@/pages/nanny/NannySettingsPage'

// Admin pages
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminVerificationQueuePage } from '@/pages/admin/AdminVerificationQueuePage'
import { AdminDisputesPage } from '@/pages/admin/AdminDisputesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

const router = createBrowserRouter([
  // ── Public routes ─────────────────────────────────────
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'locations', element: <LocationsPage /> },
    ],
  },

  // ── Auth routes ───────────────────────────────────────
  {
    path: '/login',
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/register',
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [{ index: true, element: <RegisterPage /> }],
  },

  // ── Family dashboard ──────────────────────────────────
  {
    path: '/family',
    element: <ProtectedRoute role="family"><DashboardLayout role="family" /></ProtectedRoute>,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="search" replace /> },
      { path: 'dashboard', element: <Navigate to="/family/search" replace /> },
      { path: 'search', element: <SearchNanniesPage /> },
      { path: 'nanny/:nannyId', element: <NannyProfilePage /> },
      { path: 'inbox', element: <InboxPage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'contracts', element: <ContractsPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'profile', element: <FamilyProfilePage /> },
      { path: 'subscription', element: <SubscriptionPage /> },
    ],
  },

  // ── Nanny dashboard ───────────────────────────────────
  {
    path: '/nanny',
    element: <ProtectedRoute role="nanny"><DashboardLayout role="nanny" /></ProtectedRoute>,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="profile" replace /> },
      { path: 'dashboard', element: <Navigate to="/nanny/profile" replace /> },
      { path: 'profile', element: <NannyProfileEditorPage /> },
      { path: 'availability', element: <AvailabilityPage /> },
      { path: 'verification', element: <VerificationPage /> },
      { path: 'inbox', element: <NannyInboxPage /> },
      { path: 'bookings', element: <NannyBookingsPage /> },
      { path: 'earnings', element: <EarningsPage /> },
      { path: 'reviews', element: <NannyReviewsPage /> },
      { path: 'settings', element: <NannySettingsPage /> },
    ],
  },

  // ── Admin dashboard ───────────────────────────────────
  {
    path: '/admin',
    element: <ProtectedRoute role="admin"><DashboardLayout role="admin" /></ProtectedRoute>,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="analytics" replace /> },
      { path: 'dashboard', element: <Navigate to="/admin/analytics" replace /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'verifications', element: <AdminVerificationQueuePage /> },
      { path: 'disputes', element: <AdminDisputesPage /> },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  )
}

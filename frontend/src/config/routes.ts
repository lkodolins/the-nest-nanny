export const ROUTES = {
  // ── Public ────────────────────────────────────────────
  HOME: '/',
  HOW_IT_WORKS: '/how-it-works',
  PRICING: '/pricing',
  ABOUT: '/about',
  LOCATIONS: '/locations',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_FAMILY: '/register/family',
  REGISTER_NANNY: '/register/nanny',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  NANNY_SEARCH: '/search',
  NANNY_PUBLIC_PROFILE: '/nannies/:nannyId',

  // ── Family Dashboard ──────────────────────────────────
  FAMILY_DASHBOARD: '/family/dashboard',
  FAMILY_SEARCH: '/family/search',
  FAMILY_NANNY_PROFILE: '/family/nanny/:nannyId',
  FAMILY_INBOX: '/family/inbox',
  FAMILY_BOOKINGS: '/family/bookings',
  FAMILY_BOOKING_DETAIL: '/family/bookings/:bookingId',
  FAMILY_BOOKING_NEW: '/family/bookings/new',
  FAMILY_CONTRACTS: '/family/contracts',
  FAMILY_PAYMENTS: '/family/payments',
  FAMILY_FAVORITES: '/family/favorites',
  FAMILY_REVIEWS: '/family/reviews',
  FAMILY_PROFILE: '/family/profile',
  FAMILY_MESSAGES: '/family/messages',
  FAMILY_CONVERSATION: '/family/messages/:conversationId',
  FAMILY_SETTINGS: '/family/settings',
  FAMILY_SUBSCRIPTION: '/family/subscription',

  // ── Nanny Dashboard ───────────────────────────────────
  NANNY_DASHBOARD: '/nanny/dashboard',
  NANNY_PROFILE_EDITOR: '/nanny/profile',
  NANNY_PROFILE_EDIT: '/nanny/profile',
  NANNY_AVAILABILITY: '/nanny/availability',
  NANNY_VERIFICATION: '/nanny/verification',
  NANNY_INBOX: '/nanny/inbox',
  NANNY_BOOKINGS: '/nanny/bookings',
  NANNY_BOOKING_DETAIL: '/nanny/bookings/:bookingId',
  NANNY_CALENDAR: '/nanny/calendar',
  NANNY_MESSAGES: '/nanny/messages',
  NANNY_CONVERSATION: '/nanny/messages/:conversationId',
  NANNY_EARNINGS: '/nanny/earnings',
  NANNY_REVIEWS: '/nanny/reviews',
  NANNY_SETTINGS: '/nanny/settings',

  // ── Admin ─────────────────────────────────────────────
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: '/admin/users/:userId',
  ADMIN_NANNIES: '/admin/nannies',
  ADMIN_NANNY_DETAIL: '/admin/nannies/:nannyId',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_VERIFICATION: '/admin/verification',
  ADMIN_VERIFICATION_QUEUE: '/admin/verifications',
  ADMIN_VERIFICATION_DETAIL: '/admin/verification/:verificationId',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

// ── Helpers for dynamic routes ──────────────────────────
export function nannyProfilePath(nannyId: string): string {
  return ROUTES.NANNY_PUBLIC_PROFILE.replace(':nannyId', nannyId)
}

export function familyBookingDetailPath(bookingId: string): string {
  return ROUTES.FAMILY_BOOKING_DETAIL.replace(':bookingId', bookingId)
}

export function nannyBookingDetailPath(bookingId: string): string {
  return ROUTES.NANNY_BOOKING_DETAIL.replace(':bookingId', bookingId)
}

export function familyConversationPath(conversationId: string): string {
  return ROUTES.FAMILY_CONVERSATION.replace(':conversationId', conversationId)
}

export function nannyConversationPath(conversationId: string): string {
  return ROUTES.NANNY_CONVERSATION.replace(':conversationId', conversationId)
}

export function adminUserDetailPath(userId: string): string {
  return ROUTES.ADMIN_USER_DETAIL.replace(':userId', userId)
}

export function adminNannyDetailPath(nannyId: string): string {
  return ROUTES.ADMIN_NANNY_DETAIL.replace(':nannyId', nannyId)
}

export function adminVerificationDetailPath(verificationId: string): string {
  return ROUTES.ADMIN_VERIFICATION_DETAIL.replace(':verificationId', verificationId)
}

/**
 * TanStack Query key factory.
 *
 * Usage:
 *   queryKey: queryKeys.nannies.search(filters)
 *   queryKey: queryKeys.bookings.detail(id)
 */
export const queryKeys = {
  // ── Nannies ───────────────────────────────────────────
  nannies: {
    all: ['nannies'] as const,
    search: (filters: Record<string, unknown>) =>
      ['nannies', 'search', filters] as const,
    detail: (nannyId: string) => ['nannies', 'detail', nannyId] as const,
    featured: () => ['nannies', 'featured'] as const,
    availability: (nannyId: string) =>
      ['nannies', 'availability', nannyId] as const,
    reviews: (nannyId: string) => ['nannies', 'reviews', nannyId] as const,
  },

  // ── Bookings ──────────────────────────────────────────
  bookings: {
    all: ['bookings'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['bookings', 'list', filters] as const,
    detail: (bookingId: string) => ['bookings', 'detail', bookingId] as const,
    contract: (bookingId: string) =>
      ['bookings', 'contract', bookingId] as const,
  },

  // ── Messages ──────────────────────────────────────────
  messages: {
    all: ['messages'] as const,
    conversations: () => ['messages', 'conversations'] as const,
    conversation: (conversationId: string) =>
      ['messages', 'conversation', conversationId] as const,
    unreadCount: () => ['messages', 'unread-count'] as const,
  },

  // ── Payments ──────────────────────────────────────────
  payments: {
    all: ['payments'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['payments', 'list', filters] as const,
    detail: (paymentId: string) => ['payments', 'detail', paymentId] as const,
    subscription: () => ['payments', 'subscription'] as const,
    payouts: () => ['payments', 'payouts'] as const,
    earnings: () => ['payments', 'earnings'] as const,
    history: () => ['payments', 'history'] as const,
  },

  // ── Reviews ───────────────────────────────────────────
  reviews: {
    all: ['reviews'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['reviews', 'list', filters] as const,
    detail: (reviewId: string) => ['reviews', 'detail', reviewId] as const,
    forNanny: (nannyId: string) => ['reviews', 'for-nanny', nannyId] as const,
  },

  // ── Verification ──────────────────────────────────────
  verification: {
    all: ['verification'] as const,
    status: () => ['verification', 'status'] as const,
    steps: () => ['verification', 'steps'] as const,
    references: () => ['verification', 'references'] as const,
  },

  // ── Notifications ─────────────────────────────────────
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },

  // ── Admin ─────────────────────────────────────────────
  admin: {
    all: ['admin'] as const,
    users: (filters?: Record<string, unknown>) =>
      ['admin', 'users', filters] as const,
    userDetail: (userId: string) =>
      ['admin', 'user-detail', userId] as const,
    nannyDetail: (nannyId: string) =>
      ['admin', 'nanny-detail', nannyId] as const,
    pendingVerifications: () =>
      ['admin', 'pending-verifications'] as const,
    bookings: (filters?: Record<string, unknown>) =>
      ['admin', 'bookings', filters] as const,
    reports: (type: string) => ['admin', 'reports', type] as const,
    stats: () => ['admin', 'stats'] as const,
  },
} as const

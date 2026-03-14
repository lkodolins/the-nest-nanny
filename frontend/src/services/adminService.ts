import { apiClient } from '@/lib/api/client'
import type { DRFPaginatedResponse } from '@/types/api'

// ── Types ─────────────────────────────────────────────────

export interface AdminAnalytics {
  total_users: number
  total_families: number
  total_nannies: number
  active_bookings: number
  monthly_revenue: number
  churn_rate?: number
  user_growth?: { month: string; count: number }[]
  revenue_growth?: { month: string; amount: number }[]
}

export interface AdminNotification {
  id: string
  action: string
  user: string
  time: string
  read: boolean
}

export interface AdminVerificationItem {
  id: string | number
  nanny_name: string
  nanny_email?: string
  verification_type: string
  submitted_at: string
  status: 'pending' | 'approved' | 'rejected'
  priority?: 'high' | 'medium' | 'low'
  document_url?: string | null
  notes?: string | null
}

export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'family' | 'nanny' | 'admin'
  is_active: boolean
  date_joined: string
  is_verified?: boolean
}

// ── Service ───────────────────────────────────────────────

export const adminService = {
  // Analytics / platform stats
  getAnalytics: (): Promise<AdminAnalytics> =>
    apiClient.get('admin-portal/analytics/').then(r => r.data),

  // Admin notifications (recent activity)
  getNotifications: (): Promise<AdminNotification[]> =>
    apiClient.get('admin-portal/notifications/').then(r => r.data),

  // Verification queue
  getVerificationQueue: (): Promise<AdminVerificationItem[]> =>
    apiClient.get('verification/admin/queue/').then(r => r.data),

  // Approve or reject a verification
  updateVerification: (
    id: string | number,
    data: { status: 'approved' | 'rejected'; notes?: string },
  ): Promise<AdminVerificationItem> =>
    apiClient.patch(`verification/admin/${id}/update/`, data).then(r => r.data),

  // Users list (uses admin-portal if available, fallback handled in hook)
  getUsers: (params?: {
    role?: string
    status?: string
    search?: string
    page?: number
  }): Promise<DRFPaginatedResponse<AdminUser>> =>
    apiClient.get('admin-portal/users/', { params }).then(r => r.data),

  // Disputed bookings
  getDisputedBookings: (page = 1): Promise<DRFPaginatedResponse<unknown>> =>
    apiClient.get('bookings/', { params: { status: 'disputed', page } }).then(r => r.data),
}

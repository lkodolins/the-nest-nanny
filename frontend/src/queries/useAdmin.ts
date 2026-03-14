import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { queryKeys } from '@/config/queryKeys'

// ── Analytics ─────────────────────────────────────────────

export function useAdminAnalytics() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => adminService.getAnalytics(),
  })
}

// ── Notifications (recent activity) ──────────────────────

export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin', 'notifications'] as const,
    queryFn: () => adminService.getNotifications(),
  })
}

// ── Verification Queue ───────────────────────────────────

export function useAdminVerificationQueue() {
  return useQuery({
    queryKey: queryKeys.admin.pendingVerifications(),
    queryFn: () => adminService.getVerificationQueue(),
  })
}

export function useAdminUpdateVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: { status: 'approved' | 'rejected'; notes?: string }
    }) => adminService.updateVerification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingVerifications() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
    },
  })
}

// ── Users ─────────────────────────────────────────────────

export function useAdminUsers(filters?: {
  role?: string
  status?: string
  search?: string
  page?: number
}) {
  return useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: () => adminService.getUsers(filters),
  })
}

// ── Disputed Bookings ────────────────────────────────────

export function useAdminDisputedBookings(page = 1) {
  return useQuery({
    queryKey: queryKeys.admin.bookings({ status: 'disputed', page }),
    queryFn: () => adminService.getDisputedBookings(page),
  })
}

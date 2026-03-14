import { apiClient } from '@/lib/api/client'
import type { EscrowPayment, Subscription, Payout } from '@/types/payment'
import type { DRFPaginatedResponse } from '@/types/api'

export const paymentService = {
  createEscrow: (bookingId: number): Promise<EscrowPayment> =>
    apiClient.post('payments/escrow/create/', { booking_id: bookingId }).then(r => r.data),

  releaseEscrow: (escrowId: number): Promise<EscrowPayment> =>
    apiClient.post(`payments/escrow/${escrowId}/release/`).then(r => r.data),

  getPaymentHistory: (page = 1): Promise<DRFPaginatedResponse<EscrowPayment>> =>
    apiClient.get('payments/history/', { params: { page } }).then(r => r.data),

  getSubscription: (): Promise<Subscription | null> =>
    apiClient.get('payments/subscription/').then(r => r.data).catch((err: Record<string, unknown>) => {
      // 404 means no subscription - return null instead of throwing
      const detail = typeof err?.detail === 'string' ? err.detail : ''
      if (detail.toLowerCase().includes('no active')) return null
      throw err
    }),

  createSubscription: (plan: string): Promise<Record<string, unknown>> =>
    apiClient.post('payments/subscription/', { plan }).then(r => r.data),

  cancelSubscription: (): Promise<void> =>
    apiClient.post('payments/subscription/cancel/').then(() => {}),

  getNannyEarnings: (): Promise<{
    total_earned: number
    pending_amount: number
    this_month: number
    currency: string
  }> =>
    apiClient.get('payments/earnings/').then(r => r.data),

  getNannyPayouts: (page = 1): Promise<DRFPaginatedResponse<Payout>> =>
    apiClient.get('payments/payouts/', { params: { page } }).then(r => r.data),
}

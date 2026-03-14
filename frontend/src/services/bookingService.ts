import { apiClient } from '@/lib/api/client'
import type { Booking, Contract } from '@/types/booking'
import type { DRFPaginatedResponse } from '@/types/api'

export const bookingService = {
  list: (status?: string, page = 1): Promise<DRFPaginatedResponse<Booking>> =>
    apiClient.get('bookings/', { params: { status, page } }).then(r => r.data),

  create: (data: {
    nanny_id: number
    booking_type: string
    start_date: string
    end_date?: string
    start_time?: string
    end_time?: string
    hours_per_week?: number
    notes?: string
  }): Promise<Booking> =>
    apiClient.post('bookings/create/', data).then(r => r.data),

  getDetail: (id: string): Promise<Booking> =>
    apiClient.get(`bookings/${id}/`).then(r => r.data),

  updateStatus: (id: string, status: string, reason?: string): Promise<Booking> =>
    apiClient.patch(`bookings/${id}/status/`, { status, cancellation_reason: reason }).then(r => r.data),

  getContract: (bookingId: string): Promise<Contract> =>
    apiClient.get(`bookings/${bookingId}/contract/`).then(r => r.data),

  createContract: (bookingId: string, terms: string): Promise<Contract> =>
    apiClient.post(`bookings/${bookingId}/contract/`, { terms }).then(r => r.data),

  signContract: (bookingId: string, signature: string): Promise<Contract> =>
    apiClient.post(`bookings/${bookingId}/contract/sign/`, { signature }).then(r => r.data),
}

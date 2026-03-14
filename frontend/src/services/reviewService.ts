import { apiClient } from '@/lib/api/client'
import type { Review } from '@/types/review'
import type { DRFPaginatedResponse } from '@/types/api'

export const reviewService = {
  create: (data: {
    booking_id: number
    rating: number
    title: string
    content: string
  }): Promise<Review> =>
    apiClient.post('reviews/create/', data).then(r => r.data),

  getForNanny: (nannyId: string, page = 1): Promise<DRFPaginatedResponse<Review>> =>
    apiClient.get(`reviews/nanny/${nannyId}/`, { params: { page } }).then(r => r.data),

  getMyReviews: (page = 1): Promise<DRFPaginatedResponse<Review>> =>
    apiClient.get('reviews/my/', { params: { page } }).then(r => r.data),

  getDetail: (id: string): Promise<Review> =>
    apiClient.get(`reviews/${id}/`).then(r => r.data),

  respondToReview: (id: string, response: string): Promise<Review> =>
    apiClient.post(`reviews/${id}/respond/`, { response }).then(r => r.data),
}

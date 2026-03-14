import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '@/services/reviewService'
import { queryKeys } from '@/config/queryKeys'

export function useNannyReviews(nannyId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.forNanny(nannyId),
    queryFn: () => reviewService.getForNanny(nannyId),
    enabled: !!nannyId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['nannies'] })
    },
  })
}

export function useRespondToReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, response }: { id: string | number; response: string }) =>
      reviewService.respondToReview(String(id), response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

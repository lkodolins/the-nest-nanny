import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentService } from '@/services/paymentService'
import { queryKeys } from '@/config/queryKeys'

export function usePaymentHistory() {
  return useQuery({
    queryKey: queryKeys.payments.history(),
    queryFn: () => paymentService.getPaymentHistory(),
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.payments.subscription(),
    queryFn: () => paymentService.getSubscription(),
  })
}

export function useNannyEarnings() {
  return useQuery({
    queryKey: queryKeys.payments.earnings(),
    queryFn: () => paymentService.getNannyEarnings(),
  })
}

export function useNannyPayouts() {
  return useQuery({
    queryKey: queryKeys.payments.payouts(),
    queryFn: () => paymentService.getNannyPayouts(),
  })
}

export function useCreateEscrow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: number) => paymentService.createEscrow(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (plan: string) => paymentService.createSubscription(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.subscription() })
    },
  })
}

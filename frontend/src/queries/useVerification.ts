import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { verificationService } from '@/services/verificationService'
import { queryKeys } from '@/config/queryKeys'

export function useVerificationStatus() {
  return useQuery({
    queryKey: queryKeys.verification.status(),
    queryFn: () => verificationService.getStatus(),
  })
}

export function useStartIdentityVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => verificationService.startIdentityVerification(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.status() })
    },
  })
}

export function useSubmitReference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: verificationService.submitReference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.status() })
    },
  })
}

import { apiClient } from '@/lib/api/client'
import type { VerificationRecord, Reference } from '@/types/verification'

export const verificationService = {
  getStatus: (): Promise<VerificationRecord[]> =>
    apiClient.get('verification/status/').then(r => r.data),

  startIdentityVerification: (): Promise<{ verification_url: string; session_id: string }> =>
    apiClient.post('verification/identity/start/').then(r => r.data),

  startVerificationStep: (step: string): Promise<{ verification_url: string; verification_record: VerificationRecord }> =>
    apiClient.post(`verification/${step}/start/`).then(r => r.data),

  submitReference: (data: {
    referee_name: string
    referee_email: string
    referee_phone?: string
    relationship: string
    employer_name?: string
    years_known: number
  }): Promise<Reference> =>
    apiClient.post('verification/references/submit/', data).then(r => r.data),
}

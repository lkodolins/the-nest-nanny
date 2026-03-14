export type VerificationStatus =
  | 'not_started'
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'expired'

export type VerificationStepType =
  | 'identity'
  | 'background_check'
  | 'certifications'
  | 'references'

export interface VerificationRecord {
  id: string
  nanny: string | number
  step: VerificationStepType
  step_display: string
  status: VerificationStatus
  status_display: string
  provider_reference: string | null
  notes: string | null
  rejection_reason: string | null
  reviewed_by: string | number | null
  submitted_at: string | null
  reviewed_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Reference {
  id: string
  nanny: string | number
  referee_name: string
  referee_email: string
  referee_phone: string | null
  relationship: string
  employer_name: string | null
  years_known: number
  reference_text: string | null
  is_verified: boolean
  verified_by: string | number | null
  verified_at: string | null
  created_at: string
}

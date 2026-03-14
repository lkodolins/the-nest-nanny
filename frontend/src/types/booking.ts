import type { User } from './user'
import type { NannyCard } from './nanny'

export type BookingType = 'one_off' | 'regular' | 'live_in'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export interface Booking {
  id: number
  family: number
  nanny: number
  family_user: User
  nanny_card: NannyCard
  booking_type: BookingType
  status: BookingStatus
  start_date: string
  end_date: string | null
  start_time: string | null
  end_time: string | null
  hours_per_week: string | null
  hourly_rate: string
  total_amount: string
  currency: 'EUR' | 'USD' | 'QAR'
  notes: string
  cancellation_reason: string | null
  created_at: string
  updated_at: string
}

export interface Contract {
  id: number
  booking: number
  terms: string
  special_conditions: string | null
  family_signed: boolean
  family_signed_at: string | null
  family_signature: string | null
  nanny_signed: boolean
  nanny_signed_at: string | null
  nanny_signature: string | null
  is_active: boolean
  is_fully_signed: boolean
  created_at: string
  updated_at: string
}

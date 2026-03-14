export type EscrowStatus =
  | 'held'
  | 'released'
  | 'refunded'
  | 'disputed'

export interface EscrowPayment {
  id: string
  booking: string | number
  amount: number
  platform_fee: number
  nanny_amount: number
  currency: 'EUR' | 'USD' | 'QAR'
  status: EscrowStatus
  stripe_payment_intent_id: string | null
  created_at: string
  released_at: string | null
  refunded_at: string | null
}

export type SubscriptionPlan = 'basic' | 'premium' | 'elite' | 'family_basic' | 'family_premium' | 'family_elite' | 'nanny_standard'

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'trialing'
  | 'incomplete'

export interface Subscription {
  id: string
  user: string | number
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripe_subscription_id: string
  stripe_customer_id: string
  current_period_start: string
  current_period_end: string
  is_premium: boolean
  created_at: string
  updated_at: string
}

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Payout {
  id: string
  nanny: string | number
  amount: number
  currency: 'EUR' | 'USD' | 'QAR'
  status: PayoutStatus
  stripe_payout_id: string | null
  escrow_payment: string | number | null
  created_at: string
  paid_at: string | null
}

import type { User } from './user'

export interface Language {
  id: number
  name: string
  code: string
}

export interface Specialization {
  id: number
  name: string
  slug: string
  description: string
}

export interface AgeGroup {
  id: number
  name: string
  min_age: number
  max_age: number
}

export interface Certification {
  id: number
  type: string
  name: string
  issuing_body: string
  certificate_number: string
  valid_from: string
  valid_until: string | null
  document: string | null
  is_verified: boolean
  verified_at: string | null
  is_valid: boolean
}

export interface NannyPhoto {
  id: number
  image: string
  is_primary: boolean
  order: number
  created_at: string
}

export interface NannyAvailability {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_recurring: boolean
  specific_date: string | null
}

export interface NannyProfile {
  id: number
  user: User
  bio: string
  headline: string
  years_experience: number
  city: string
  country: string
  hourly_rate: string
  currency: 'EUR' | 'USD' | 'QAR'
  languages: Language[]
  specializations: Specialization[]
  age_groups: AgeGroup[]
  certifications: Certification[]
  availability_slots: NannyAvailability[]
  photos: NannyPhoto[]
  rating_average: string
  review_count: number
  is_verified: boolean
  is_featured: boolean
  is_available: boolean
  is_profile_complete: boolean
  created_at: string
  updated_at: string
}

/** Lighter payload used in search result cards. */
export interface NannyCard {
  id: number
  first_name: string
  last_name: string
  avatar: string | null
  headline: string
  bio: string
  city: string
  hourly_rate: string
  currency: 'EUR' | 'USD' | 'QAR'
  languages: Language[]
  specializations: Specialization[]
  rating_average: string
  review_count: number
  is_verified: boolean
  is_available: boolean
  years_experience: number
}

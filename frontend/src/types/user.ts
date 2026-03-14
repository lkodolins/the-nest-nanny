export type UserRole = 'family' | 'nanny' | 'admin'

export interface User {
  id: string | number
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone: string | null
  avatar: string | null
  is_email_verified: boolean
  date_joined: string
}

export interface FamilyProfile {
  id: string
  bio: string | null
  city: string
  country: string
  address: string
  latitude: number | null
  longitude: number | null
  children: { age: number; name?: string }[] | null
  preferred_languages: { id: number; name: string }[]
  created_at: string
  updated_at: string
}

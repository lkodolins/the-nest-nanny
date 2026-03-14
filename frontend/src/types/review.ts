import type { User } from './user'

export interface Review {
  id: number
  booking: number
  reviewer: User
  nanny: number
  rating: number          // 1–5
  title: string | null
  content: string
  is_published: boolean
  response: string | null
  response_at: string | null
  created_at: string
  updated_at: string
}

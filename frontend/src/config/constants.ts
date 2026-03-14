export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8000'

export const APP_NAME = 'The Nest Nanny'

export const DEFAULT_CURRENCY = 'EUR' as const

export interface SupportedCity {
  id: string
  name: string
  country: string
  flag: string
  currency: 'EUR' | 'USD' | 'QAR'
  timezone: string
}

export const SUPPORTED_CITIES: SupportedCity[] = [
  {
    id: 'marbella',
    name: 'Marbella',
    country: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
  {
    id: 'riga',
    name: 'Riga',
    country: 'Latvia',
    flag: '🇱🇻',
    currency: 'EUR',
    timezone: 'Europe/Riga',
  },
  {
    id: 'warsaw',
    name: 'Warsaw',
    country: 'Poland',
    flag: '🇵🇱',
    currency: 'EUR',
    timezone: 'Europe/Warsaw',
  },
  {
    id: 'doha',
    name: 'Doha',
    country: 'Qatar',
    flag: '🇶🇦',
    currency: 'QAR',
    timezone: 'Asia/Qatar',
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    country: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
  },
]

export const PAGINATION_DEFAULT_LIMIT = 20

export const MAX_UPLOAD_SIZE_MB = 10

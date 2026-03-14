import apiClient from '../lib/api/client'
import type { User } from '../types/user'

// ── Response types ──────────────────────────────────────

/** What the Django backend actually returns */
interface BackendAuthResponse {
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'family' | 'nanny'
  phone?: string
  city?: string
}

function normalizeResponse(data: BackendAuthResponse): AuthResponse {
  return {
    user: data.user,
    accessToken: data.tokens.access,
    refreshToken: data.tokens.refresh,
  }
}

// ── API calls ───────────────────────────────────────────

export async function loginFamily(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<BackendAuthResponse>('auth/login/', {
    email,
    password,
  })
  return normalizeResponse(data)
}

export async function loginNanny(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<BackendAuthResponse>('auth/login/', {
    email,
    password,
  })
  return normalizeResponse(data)
}

export async function registerFamily(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<BackendAuthResponse>(
    'auth/register/family/',
    {
      email: payload.email,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone || '',
    },
  )
  return normalizeResponse(data)
}

export async function registerNanny(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<BackendAuthResponse>(
    'auth/register/nanny/',
    {
      email: payload.email,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone || '',
      city: payload.city || 'riga',
    },
  )
  return normalizeResponse(data)
}

export async function loginWithGoogle(
  credential: string,
  role: 'family' | 'nanny' = 'family',
): Promise<AuthResponse> {
  const { data } = await apiClient.post<BackendAuthResponse>('auth/login/google/', {
    credential,
    role,
  })
  return normalizeResponse(data)
}

export async function logout(): Promise<void> {
  const refreshToken = getStoredRefreshToken()
  if (refreshToken) {
    await apiClient.post('auth/logout/', { refresh: refreshToken })
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  const stored = getStoredRefreshToken()
  if (!stored) throw new Error('No refresh token')
  const { data } = await apiClient.post<{ access: string }>('auth/token/refresh/', {
    refresh: stored,
  })
  return {
    user: null as unknown as User, // caller should keep existing user
    accessToken: data.access,
    refreshToken: stored,
  }
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    'auth/verify-email/',
    { token },
  )
  return data
}

// ── Refresh token storage (localStorage, not in-memory) ──
const REFRESH_KEY = 'nn_refresh_token'

export function storeRefreshToken(token: string) {
  localStorage.setItem(REFRESH_KEY, token)
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function clearStoredRefreshToken() {
  localStorage.removeItem(REFRESH_KEY)
}

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../../types/user'
import { setToken, clearToken } from './tokenStorage'
import * as authService from '../../services/authService'

// ── Types ───────────────────────────────────────────────
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (email: string, password: string, role: 'family' | 'nanny') => Promise<void>
  loginWithGoogle: (credential: string, role: 'family' | 'nanny') => Promise<void>
  register: (payload: authService.RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
}

export type AuthContextValue = AuthState & AuthActions

// ── Context ─────────────────────────────────────────────
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ── Provider ────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = user !== null

  const clearError = useCallback(() => setError(null), [])

  // Restore session on mount: refresh token → fetch user profile
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const storedRefresh = authService.getStoredRefreshToken()
      if (!storedRefresh) {
        setIsLoading(false)
        return
      }
      try {
        // Get a new access token
        const result = await authService.refreshToken()
        if (cancelled) return
        setToken(result.accessToken)

        // Fetch the user profile with the new token
        const { default: apiClient } = await import('../api/client')
        const { data } = await apiClient.get<User>('auth/profile/')
        if (!cancelled) {
          setUser(data)
        }
      } catch {
        // Token expired or invalid — clear everything
        clearToken()
        authService.clearStoredRefreshToken()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string, role: 'family' | 'nanny') => {
      setIsLoading(true)
      setError(null)
      try {
        const loginFn =
          role === 'family' ? authService.loginFamily : authService.loginNanny
        const result = await loginFn(email, password)
        setToken(result.accessToken)
        authService.storeRefreshToken(result.refreshToken)
        setUser(result.user)
      } catch (err: unknown) {
        const message =
          (err as { detail?: string })?.detail ||
          (err as { message?: string })?.message ||
          'Login failed. Please check your credentials.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const loginWithGoogle = useCallback(
    async (credential: string, role: 'family' | 'nanny') => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await authService.loginWithGoogle(credential, role)
        setToken(result.accessToken)
        authService.storeRefreshToken(result.refreshToken)
        setUser(result.user)
      } catch (err: unknown) {
        const message =
          (err as { detail?: string })?.detail ||
          (err as { message?: string })?.message ||
          'Google login failed. Please try again.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const register = useCallback(
    async (payload: authService.RegisterPayload) => {
      setIsLoading(true)
      setError(null)
      try {
        const registerFn =
          payload.role === 'family'
            ? authService.registerFamily
            : authService.registerNanny
        const result = await registerFn(payload)
        setToken(result.accessToken)
        authService.storeRefreshToken(result.refreshToken)
        setUser(result.user)
      } catch (err: unknown) {
        const message =
          (err as { detail?: string })?.detail ||
          (err as { email?: string[] })?.email?.[0] ||
          (err as { message?: string })?.message ||
          'Registration failed. Please try again.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearToken()
      authService.clearStoredRefreshToken()
      setUser(null)
    }
  }, [])

  const refreshTokenAction = useCallback(async () => {
    const result = await authService.refreshToken()
    setToken(result.accessToken)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshToken: refreshTokenAction,
      setUser,
      clearError,
    }),
    [user, isAuthenticated, isLoading, error, login, loginWithGoogle, register, logout, refreshTokenAction, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

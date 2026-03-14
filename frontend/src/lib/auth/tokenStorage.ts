/**
 * In-memory token storage.
 *
 * The access token is never written to localStorage or sessionStorage
 * to reduce XSS attack surface. The refresh token is handled as an
 * httpOnly cookie by the backend.
 */

let accessToken: string | null = null

export function getToken(): string | null {
  return accessToken
}

export function setToken(token: string): void {
  accessToken = token
}

export function clearToken(): void {
  accessToken = null
}

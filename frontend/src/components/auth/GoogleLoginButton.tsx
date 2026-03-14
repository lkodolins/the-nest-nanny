import { useEffect, useRef, useCallback } from 'react'
import { GOOGLE_CLIENT_ID } from '@/config/constants'

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              width?: string | number
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              logo_alignment?: 'left' | 'center'
            },
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void
  onError?: () => void
  text?: 'signin_with' | 'signup_with' | 'continue_with'
}

let scriptLoaded = false
let scriptLoading = false
const loadCallbacks: (() => void)[] = []

function loadGoogleScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve()
  return new Promise((resolve) => {
    if (scriptLoading) {
      loadCallbacks.push(resolve)
      return
    }
    scriptLoading = true
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      scriptLoaded = true
      scriptLoading = false
      resolve()
      loadCallbacks.forEach((cb) => cb())
      loadCallbacks.length = 0
    }
    document.head.appendChild(script)
  })
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  text = 'continue_with',
}: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      if (response.credential) {
        onSuccess(response.credential)
      } else {
        onError?.()
      }
    },
    [onSuccess, onError],
  )

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initializedRef.current) return

    loadGoogleScript().then(() => {
      if (!window.google || !buttonRef.current || initializedRef.current) return
      initializedRef.current = true

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: buttonRef.current.offsetWidth || 400,
        text,
        shape: 'pill',
        logo_alignment: 'center',
      })
    })
  }, [handleCredentialResponse, text])

  // If no Google Client ID configured, show a disabled placeholder
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-cream-300 bg-white py-3 text-sm font-medium text-charcoal-muted opacity-60"
      >
        <GoogleIcon />
        Google login not configured
      </button>
    )
  }

  return <div ref={buttonRef} className="w-full [&>div]:!w-full" />
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default GoogleLoginButton

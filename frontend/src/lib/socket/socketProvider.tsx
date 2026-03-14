import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import { getToken } from '@/lib/auth/tokenStorage'

interface SocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (type: string, data: unknown) => void
  subscribe: (type: string, handler: (data: unknown) => void) => () => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  subscribe: () => () => {},
})

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8000/ws/messaging/'

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const socketRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const handlersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map())

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.close()
      return
    }

    const token = getToken()
    if (!token) return

    const ws = new WebSocket(`${SOCKET_URL}?token=${token}`)

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const type = data.type
        const handlers = handlersRef.current.get(type)
        if (handlers) {
          handlers.forEach((handler) => handler(data))
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    ws.onerror = () => {
      setIsConnected(false)
    }

    socketRef.current = ws

    return () => {
      ws.close()
    }
  }, [isAuthenticated])

  const sendMessage = (type: string, data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, ...data as object }))
    }
  }

  const subscribe = (type: string, handler: (data: unknown) => void) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set())
    }
    handlersRef.current.get(type)!.add(handler)

    return () => {
      handlersRef.current.get(type)?.delete(handler)
    }
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, sendMessage, subscribe }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}

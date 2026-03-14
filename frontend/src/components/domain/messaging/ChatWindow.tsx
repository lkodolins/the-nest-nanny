import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
  type: 'text' | 'system' | 'booking_request'
}

interface ChatWindowProps {
  messages: ChatMessage[]
  currentUserId: string
  recipientName: string
  recipientAvatar?: string
  onSendMessage: (content: string) => void
  isTyping?: boolean
}

export function ChatWindow({
  messages,
  currentUserId,
  recipientName,
  recipientAvatar,
  onSendMessage,
  isTyping = false,
}: ChatWindowProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cream-300 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-cream-200">
            {recipientAvatar ? (
              <img src={recipientAvatar} alt={recipientName} className="h-full w-full object-cover" />
            ) : (
              <span className="font-serif text-sm text-charcoal-muted">
                {recipientName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-charcoal">{recipientName}</h3>
            {isTyping && (
              <p className="text-xs text-gold-400">typing...</p>
            )}
          </div>
        </div>
        <button className="rounded-lg p-2 text-charcoal-muted hover:bg-cream-200">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMine = msg.senderId === currentUserId
            const isSystem = msg.type === 'system'

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="rounded-full bg-cream-200 px-3 py-1 text-xs text-charcoal-muted">
                    {msg.content}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={msg.id}
                className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-2.5',
                    isMine
                      ? 'rounded-br-sm bg-gold-400/10 text-charcoal'
                      : 'rounded-bl-sm bg-cream-200 text-charcoal'
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      'mt-1 text-right text-xs',
                      isMine ? 'text-charcoal-muted' : 'text-charcoal-muted'
                    )}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-cream-200 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal-muted [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal-muted [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal-muted [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-cream-300 px-6 py-4">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-charcoal-muted hover:bg-cream-200 hover:text-charcoal">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-muted focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              'rounded-xl p-2.5 transition-all',
              input.trim()
                ? 'bg-gold-400 text-white hover:bg-gold-500'
                : 'bg-cream-200 text-charcoal-muted'
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow

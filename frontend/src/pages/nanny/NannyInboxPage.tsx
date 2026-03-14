import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Search, Send } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useAuth } from '@/lib/auth/useAuth'
import { useConversations, useMessages, useSendMessage } from '@/queries/useMessages'
import type { Conversation } from '@/types/messaging'

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function NannyInboxPage() {
  const { user } = useAuth()
  const { data: conversations, isLoading: convsLoading, error: convsError } = useConversations()
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messagesData, isLoading: msgsLoading } = useMessages(selectedConvId || '')
  const sendMessage = useSendMessage()

  const messages = messagesData?.results ?? []

  const convList = Array.isArray(conversations) ? conversations : []
  const selectedConv = convList.find((c) => c.id === selectedConvId) ?? null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredConversations = convList.filter((c) => {
    if (!searchQuery) return true
    const familyName = c.family ? `${c.family.first_name} ${c.family.last_name}` : ''
    return familyName.toLowerCase().includes(searchQuery.toLowerCase())
  }) ?? []

  // For nanny inbox, the other participant is the family
  const getOtherParticipantName = (conv: Conversation): string => {
    const other = conv.family
    if (!other) return 'Unknown'
    return `${other.first_name} ${other.last_name}`.trim() || 'Unknown'
  }

  const getOtherParticipantAvatar = (conv: Conversation): string | null => {
    return conv.family?.avatar ?? null
  }

  const handleSend = () => {
    if (!messageText.trim() || !selectedConvId) return
    sendMessage.mutate(
      { conversationId: selectedConvId, content: messageText.trim() },
      { onSuccess: () => setMessageText('') },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (convsError) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Messages</h1>
        <p className="mb-6 text-charcoal-muted">Communicate with families</p>
        <div className="rounded-2xl border border-error-500/30 bg-error-50/30 p-8 text-center">
          <p className="text-error-700">Failed to load conversations. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-2">NANNIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Messages</h1>
      <p className="mb-6 text-charcoal-muted">Communicate with families</p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation list */}
        <div className="rounded-2xl border border-cream-300 bg-white shadow-card lg:col-span-1">
          <div className="border-b border-cream-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="divide-y divide-cream-200">
            {convsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <Skeleton width={40} height={40} rounded />
                  <div className="flex-1">
                    <Skeleton className="mb-1" width={120} height={16} />
                    <Skeleton width={180} height={14} />
                  </div>
                </div>
              ))
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-charcoal-muted">
                  {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const name = getOtherParticipantName(conv)
                const avatar = getOtherParticipantAvatar(conv)
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-50 ${
                      selectedConvId === conv.id ? 'bg-cream-50' : ''
                    }`}
                  >
                    {avatar ? (
                      <img src={avatar} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/10 font-serif text-sm text-gold-600">
                        {getInitials(name)}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-charcoal">{name}</p>
                        {conv.last_message && (
                          <span className="text-xs text-charcoal-muted">
                            {formatTime(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-charcoal-muted">
                        {conv.last_message?.content || 'No messages yet'}
                      </p>
                    </div>
                    {(conv.unread_count ?? 0) > 0 && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-400" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        {selectedConvId && selectedConv ? (
          <div className="flex flex-col rounded-2xl border border-cream-300 bg-white shadow-card lg:col-span-2" style={{ minHeight: 400 }}>
            {/* Chat header */}
            <div className="border-b border-cream-200 px-5 py-3">
              <p className="font-medium text-charcoal">{getOtherParticipantName(selectedConv)}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ maxHeight: 400 }}>
              {msgsLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <Skeleton width={200} height={40} className="rounded-2xl" />
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-charcoal-muted">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = String(msg.sender?.id ?? '') === String(user?.id ?? '')
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          isOwn
                            ? 'bg-gold-400 text-white'
                            : 'bg-cream-100 text-charcoal'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`mt-1 text-xs ${isOwn ? 'text-white/70' : 'text-charcoal-muted'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-cream-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMessage.isPending}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-cream-300 bg-white p-12 shadow-card lg:col-span-2">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-200">
              <MessageSquare className="h-7 w-7 text-charcoal-muted" />
            </div>
            <h3 className="mb-2 font-serif text-lg text-charcoal">Select a conversation</h3>
            <p className="text-center text-sm text-charcoal-muted">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NannyInboxPage

import { useState } from 'react'
import { MessageSquare, Search } from 'lucide-react'
import { useConversations, useMessages, useSendMessage } from '@/queries/useMessages'
import { useAuth } from '@/lib/auth/useAuth'
import { useMessagingStore } from '@/stores/messagingStore'
import { ChatWindow } from '@/components/domain/messaging/ChatWindow'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'
import type { Conversation } from '@/types/messaging'

export function InboxPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const { activeConversationId, setActiveConversation } = useMessagingStore()

  const { data: conversations, isLoading: convsLoading } = useConversations()
  const { data: messagesData, isLoading: msgsLoading } = useMessages(activeConversationId ?? '')
  const sendMessage = useSendMessage()

  const conversationList = Array.isArray(conversations) ? conversations : []

  // Filter conversations by search
  const filteredConversations = searchQuery
    ? conversationList.filter((c) => {
        const nannyName = c.nanny ? `${c.nanny.first_name} ${c.nanny.last_name}` : ''
        return nannyName.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : conversationList

  // Find active conversation details
  const activeConversation = conversationList.find((c) => c.id === activeConversationId)

  // Get the other participant (the nanny, since this is the family inbox)
  const getRecipient = (conv: Conversation) => {
    const other = conv.nanny
    const name = other ? `${other.first_name} ${other.last_name}` : 'Unknown'
    const avatar = other?.avatar ?? undefined
    return { name, avatar }
  }

  const messages = messagesData?.results ?? []

  const handleSend = (content: string) => {
    if (activeConversationId) {
      sendMessage.mutate({ conversationId: activeConversationId, content })
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      <p className="section-label mb-2">FAMILIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Messages</h1>
      <p className="mb-6 text-charcoal-muted">Communicate with your nannies</p>

      <div className="grid gap-6 lg:grid-cols-3" style={{ minHeight: 500 }}>
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

          {convsLoading ? (
            <div className="divide-y divide-cream-200">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <Skeleton width={40} height={40} rounded />
                  <div className="flex-1 space-y-1">
                    <Skeleton width="60%" height={14} />
                    <Skeleton width="80%" height={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-48 items-center justify-center p-6 text-center">
              <div>
                <p className="font-serif text-lg text-charcoal">No conversations</p>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Start a conversation by messaging a nanny
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-cream-200">
              {filteredConversations.map((conv) => {
                const recipient = getRecipient(conv)
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-50',
                      activeConversationId === conv.id && 'bg-gold-400/5'
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold-400/10 font-serif text-sm text-gold-600">
                      {recipient.avatar ? (
                        <img src={recipient.avatar} alt={recipient.name} className="h-full w-full object-cover" />
                      ) : (
                        recipient.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          'text-sm',
                          (conv.unread_count ?? 0) > 0 ? 'font-semibold text-charcoal' : 'font-medium text-charcoal'
                        )}>
                          {recipient.name}
                        </p>
                        <span className="text-xs text-charcoal-muted">
                          {conv.last_message ? formatTime(conv.last_message.created_at) : ''}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between">
                        <p className={cn(
                          'truncate text-sm',
                          (conv.unread_count ?? 0) > 0 ? 'font-medium text-charcoal' : 'text-charcoal-muted'
                        )}>
                          {conv.last_message?.content ?? 'No messages yet'}
                        </p>
                        {(conv.unread_count ?? 0) > 0 && (
                          <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-medium text-white">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Chat area */}
        {activeConversationId && activeConversation ? (
          <div className="rounded-2xl border border-cream-300 bg-white shadow-card lg:col-span-2 overflow-hidden">
            {msgsLoading ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-cream-300 px-6 py-4">
                  <Skeleton width={40} height={40} rounded />
                  <Skeleton width={120} height={16} />
                </div>
                <div className="flex-1 space-y-4 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                      <Skeleton width={200} height={40} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ChatWindow
                messages={messages.map((m) => ({
                  id: m.id,
                  senderId: String(m.sender?.id ?? ''),
                  content: m.content,
                  timestamp: m.created_at,
                  isRead: m.is_read,
                  type: m.message_type === 'system' ? 'system' : m.message_type === 'booking-request' ? 'booking_request' : 'text',
                }))}
                currentUserId={String(user?.id ?? '')}
                recipientName={getRecipient(activeConversation).name}
                recipientAvatar={getRecipient(activeConversation).avatar}
                onSendMessage={handleSend}
              />
            )}
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

export default InboxPage

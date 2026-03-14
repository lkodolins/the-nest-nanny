import { cn } from '@/lib/utils/cn'

interface ConversationItem {
  id: string
  recipientName: string
  recipientAvatar?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  isOnline?: boolean
}

interface ConversationListProps {
  conversations: ConversationItem[]
  activeId?: string
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
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

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="font-serif text-lg text-charcoal">No conversations yet</p>
          <p className="mt-1 text-sm text-charcoal-muted">
            Start a conversation by messaging a nanny
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            'flex w-full items-start gap-3 border-b border-cream-200 px-4 py-4 text-left transition-colors hover:bg-cream-100',
            activeId === conv.id && 'bg-gold-400/5'
          )}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-cream-200">
              {conv.recipientAvatar ? (
                <img src={conv.recipientAvatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-serif text-lg text-charcoal-muted">
                  {conv.recipientName.charAt(0)}
                </span>
              )}
            </div>
            {conv.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-success-500" />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className={cn(
                'truncate text-sm',
                conv.unreadCount > 0 ? 'font-semibold text-charcoal' : 'font-medium text-charcoal'
              )}>
                {conv.recipientName}
              </h4>
              <span className="flex-shrink-0 text-xs text-charcoal-muted">
                {formatTime(conv.lastMessageAt)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <p className={cn(
                'truncate text-xs',
                conv.unreadCount > 0 ? 'font-medium text-charcoal' : 'text-charcoal-muted'
              )}>
                {conv.lastMessage}
              </p>
              {conv.unreadCount > 0 && (
                <span className="ml-2 flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-medium text-white">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default ConversationList

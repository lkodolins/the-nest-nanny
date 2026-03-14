import { create } from 'zustand'

interface MessagingState {
  activeConversationId: string | null
  typingUsers: Record<string, boolean>
  unreadCounts: Record<string, number>

  setActiveConversation: (id: string | null) => void
  setUserTyping: (conversationId: string, isTyping: boolean) => void
  setUnreadCount: (conversationId: string, count: number) => void
  incrementUnread: (conversationId: string) => void
  clearUnread: (conversationId: string) => void
}

export const useMessagingStore = create<MessagingState>((set) => ({
  activeConversationId: null,
  typingUsers: {},
  unreadCounts: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setUserTyping: (conversationId, isTyping) =>
    set((s) => ({
      typingUsers: { ...s.typingUsers, [conversationId]: isTyping },
    })),

  setUnreadCount: (conversationId, count) =>
    set((s) => ({
      unreadCounts: { ...s.unreadCounts, [conversationId]: count },
    })),

  incrementUnread: (conversationId) =>
    set((s) => ({
      unreadCounts: {
        ...s.unreadCounts,
        [conversationId]: (s.unreadCounts[conversationId] || 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((s) => ({
      unreadCounts: { ...s.unreadCounts, [conversationId]: 0 },
    })),
}))

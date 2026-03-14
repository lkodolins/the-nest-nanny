import { apiClient } from '@/lib/api/client'
import type { Conversation, Message } from '@/types/messaging'
import type { DRFPaginatedResponse } from '@/types/api'

export const messagingService = {
  getConversations: (): Promise<Conversation[]> =>
    apiClient.get('messaging/conversations/').then(r => {
      const data = r.data
      // Handle both paginated and non-paginated responses
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.results)) return data.results
      return []
    }),

  createConversation: (familyUserId: number, nannyUserId: number): Promise<Conversation> =>
    apiClient.post('messaging/conversations/create/', {
      family_id: familyUserId,
      nanny_id: nannyUserId,
    }).then(r => r.data),

  getMessages: (conversationId: string, page = 1): Promise<DRFPaginatedResponse<Message>> =>
    apiClient.get(`messaging/conversations/${conversationId}/messages/`, { params: { page } }).then(r => r.data),

  sendMessage: (conversationId: string, content: string): Promise<Message> =>
    apiClient.post(`messaging/conversations/${conversationId}/messages/send/`, { content }).then(r => r.data),

  markAsRead: (conversationId: string): Promise<void> =>
    apiClient.post(`messaging/conversations/${conversationId}/read/`).then(() => {}),
}

import { apiClient } from '@/lib/api/client'

export interface Notification {
  id: number
  type: string
  type_display: string
  title: string
  message: string
  link: string
  is_read: boolean
  read_at: string | null
  created_at: string
}

export const notificationService = {
  list: (): Promise<Notification[]> =>
    apiClient.get('notifications/').then(r => {
      const data = r.data
      return Array.isArray(data) ? data : (data?.results ?? [])
    }),

  markRead: (id: number): Promise<Notification> =>
    apiClient.post(`notifications/${id}/read/`).then(r => r.data),

  markAllRead: (): Promise<void> =>
    apiClient.post('notifications/read/').then(() => {}),
}

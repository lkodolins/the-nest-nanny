export type MessageType = 'text' | 'image' | 'file' | 'booking-request' | 'system'

export interface Message {
  id: string
  conversation: string
  sender: {
    id: string | number
    email: string
    first_name: string
    last_name: string
    role: string
    phone: string | null
    avatar: string | null
    is_email_verified: boolean
    date_joined: string
  } | null
  content: string
  message_type: MessageType
  is_read: boolean
  created_at: string
}

export interface ConversationLastMessage {
  content: string
  sender_id: string | number
  created_at: string
}

export interface Conversation {
  id: string
  family: {
    id: string | number
    email: string
    first_name: string
    last_name: string
    role: string
    phone: string | null
    avatar: string | null
    is_email_verified: boolean
    date_joined: string
  } | null
  nanny: {
    id: string | number
    email: string
    first_name: string
    last_name: string
    role: string
    phone: string | null
    avatar: string | null
    is_email_verified: boolean
    date_joined: string
  } | null
  last_message_at: string | null
  last_message: ConversationLastMessage | null
  unread_count: number
  created_at: string
}

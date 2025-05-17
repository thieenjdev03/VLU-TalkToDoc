// ----------------------------------------------------------------------

export type IChatAttachment = {
  id: string
  name: string
  size: number
  type: string
  url: string
  preview: string
  createdAt: Date
  modifiedAt: Date
}

export interface IChatMessage {
  id: string
  _id: string
  body: string
  content: string
  contentType: string
  attachments: IChatAttachment[]
  createdAt: string
  senderId: string
  role: string
  imageUrls: string[]
}

export interface IChatParticipant {
  id: string
  name: string
  status: 'online' | 'offline' | 'away'
  avatarUrl: string
  role: string
  address?: string
  phoneNumber?: string
  email?: string
}

export interface IChatConversation {
  id: string
  _id: string
  participants: IChatParticipant[]
  messages: IChatMessage[]
  unreadCount: number
  type: 'single' | 'group'
}

export interface IChatConversations {
  byId: Record<string, IChatConversation>
  allIds: string[]
}

export interface IChatResponse {
  reply: string
  messages: IChatMessage[]
}

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
  appointmentSuggestion?: {
    type?: 'new_appointment' | 'follow_up' | 'emergency'
    doctorId: string
    doctorName: string
    doctorAvatar?: string
    doctorSpecialty: string
    suggestedDate: string
    suggestedTime: string
    reason: string
    estimatedDuration: number
    isFollowUp?: boolean
    lastAppointmentId?: string
    followUpReason?: string
    location?: string
    price?: number
    confirmationRequired?: boolean
    confirmationMessage?: string
  }
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
  appointmentSuggestion?: {
    type?: 'new_appointment' | 'follow_up' | 'emergency'
    doctorId: string
    doctorName: string
    doctorAvatar?: string
    doctorSpecialty: string
    suggestedDate: string
    suggestedTime: string
    reason: string
    estimatedDuration: number
    isFollowUp?: boolean
    lastAppointmentId?: string
    followUpReason?: string
    location?: string
    price?: number
    confirmationRequired?: boolean
    confirmationMessage?: string
  }
}

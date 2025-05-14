import axios from 'axios'
import { useMemo } from 'react'
import keyBy from 'lodash/keyBy'
import useSWR, { mutate } from 'swr'

import { fetcher, endpoints, axiosInstance } from 'src/utils/axios'

import {
  IChatMessage,
  IChatResponse,
  IChatParticipant,
  IChatConversation,
  IChatConversations
} from 'src/types/chat'

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false
}

const API_URL = 'http://localhost:3000'

export function useGetContacts() {
  const url = [endpoints.chat, { params: { endpoint: 'contacts' } }]
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, options)

  const memoizedValue = useMemo(
    () => ({
      contacts: (data?.contacts as IChatParticipant[]) || [],
      contactsLoading: isLoading,
      contactsError: error,
      contactsValidating: isValidating,
      contactsEmpty: !isLoading && !(data?.contacts && data.contacts.length)
    }),
    [data?.contacts, error, isLoading, isValidating]
  )

  return memoizedValue
}

export function useGetConversations() {
  const url = [endpoints.chat, { params: { endpoint: 'conversations' } }]
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, options)

  const memoizedValue = useMemo(() => {
    const byId = keyBy(data?.conversations, 'id') || {}
    const allIds = Object.keys(byId)
    return {
      conversations: {
        byId,
        allIds
      } as IChatConversations,
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !allIds.length
    }
  }, [data?.conversations, error, isLoading, isValidating])

  return memoizedValue
}

export function useGetConversation(conversationId: string) {
  const url = conversationId
    ? [endpoints.chat, { params: { conversationId, endpoint: 'conversation' } }]
    : ''

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, options)

  const memoizedValue = useMemo(
    () => ({
      conversation: data?.conversation as IChatConversation,
      conversationLoading: isLoading,
      conversationError: error,
      conversationValidating: isValidating
    }),
    [data?.conversation, error, isLoading, isValidating]
  )

  return memoizedValue
}

// Giao diện local: cập nhật message vào conversation (SWR mutate)
export async function localSendMessage(
  conversationId: string,
  messageData: IChatMessage
) {
  const conversationsUrl = [
    endpoints.chat,
    { params: { endpoint: 'conversations' } }
  ]
  const conversationUrl = [
    endpoints.chat,
    { params: { conversationId, endpoint: 'conversation' } }
  ]

  mutate(
    conversationUrl,
    (currentData: any) => {
      if (!currentData?.conversation) return currentData
      return {
        conversation: {
          ...currentData.conversation,
          messages: [...currentData.conversation.messages, messageData]
        }
      }
    },
    false
  )

  mutate(
    conversationsUrl,
    (currentData: any) => {
      if (!currentData?.conversations) return currentData
      const conversations: IChatConversation[] = currentData.conversations.map(
        (conversation: IChatConversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, messageData]
              }
            : conversation
      )
      return {
        ...currentData,
        conversations
      }
    },
    false
  )
}

export async function createConversation(conversationData: IChatConversation) {
  const url = [endpoints.chat, { params: { endpoint: 'conversations' } }]
  const data = { conversationData }
  const res = await axiosInstance.post(endpoints.chat, data)

  mutate(
    url,
    (currentData: any) => {
      const conversations: IChatConversation[] = [
        ...(currentData?.conversations || []),
        conversationData
      ]
      return {
        ...currentData,
        conversations
      }
    },
    false
  )

  return res.data
}

export async function clickConversation(conversationId: string) {
  const url = endpoints.chat

  mutate(
    [url, { params: { endpoint: 'conversations' } }],
    (currentData: any) => {
      if (!currentData?.conversations) return currentData
      const conversations: IChatConversations = currentData.conversations.map(
        (conversation: IChatConversation) =>
          conversation._id === conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation
      )
      return {
        ...currentData,
        conversations
      }
    },
    false
  )
}

// API thực tế cho AI chat
export async function createChat(userId: string): Promise<IChatConversation> {
  const response = await axios.post(`${API_URL}/chat`, {
    user_id: userId
  })
  return response.data
}

export async function sendMessageToAI(
  chatId: string,
  message: string,
  userId: string,
  imageUrls?: string[]
): Promise<IChatResponse> {
  const payload: any = {
    message,
    user_id: userId
  }
  if (imageUrls && imageUrls.length > 0) {
    payload.imageUrls = imageUrls
  }
  const response = await axios.post(`${API_URL}/chat/${chatId}`, payload)
  return response.data
}

export function useGetChat(chatId: string) {
  // Chưa implement, trả về null để tránh lỗi
  return {
    conversation: null,
    conversationError: null
  }
}

export function useGetChats() {
  // Chưa implement, trả về mặc định
  return {
    conversations: [],
    conversationsLoading: false
  }
}

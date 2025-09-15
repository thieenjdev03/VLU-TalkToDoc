import axios from 'axios'
import { useMemo } from 'react'
import useSWR, { mutate } from 'swr'

import { fetcher, axiosInstance } from 'src/utils/axios'

import { IConversationItem } from 'src/sections/chat/chat-conversation-sidebar'

// ----------------------------------------------------------------------

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false
}

const API_URL = import.meta.env.VITE_API_URL

// ----------------------------------------------------------------------

export function useGetConversations(userId?: string, page = 1, limit = 20, type?: string, search?: string) {
  const params = new URLSearchParams()
  if (userId) params.append('user_id', userId)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  if (type) params.append('type', type)
  if (search) params.append('search', search)
  
  const url = userId ? `${API_URL}/chat?${params.toString()}` : null

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, options)

  const memoizedValue = useMemo(
    () => ({
      conversations: (data?.data as IConversationItem[]) || [],
      pagination: data?.pagination || null,
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !(data?.data && data.data.length)
    }),
    [data, error, isLoading, isValidating]
  )

  return memoizedValue
}

// ----------------------------------------------------------------------

export function useGetConversation(conversationId?: string) {
  const url = conversationId ? `${API_URL}/chat/${conversationId}` : null

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, options)

  const memoizedValue = useMemo(
    () => ({
      conversation: data?.data?.conversation || null,
      messages: data?.data?.messages || [],
      conversationLoading: isLoading,
      conversationError: error,
      conversationValidating: isValidating
    }),
    [data, error, isLoading, isValidating]
  )

  return memoizedValue
}

// ----------------------------------------------------------------------

export async function markConversationAsRead(conversationId: string) {
  try {
    const response = await axiosInstance.patch(`${API_URL}/chat/${conversationId}/read`)
    return response.data
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    throw error
  }
}

// ----------------------------------------------------------------------

export async function createNewConversation(userId: string, modelUsed?: string, type: 'ai' | 'doctor' = 'ai') {
  try {
    const payload: any = {
      user_id: userId,
      type
    }
    
    if (modelUsed) {
      payload.model_used = modelUsed
    }

    const response = await axios.post(`${API_URL}/chat`, payload)
    return response.data
  } catch (error) {
    console.error('Error creating new conversation:', error)
    throw error
  }
}

// ----------------------------------------------------------------------

export async function deleteConversation(conversationId: string) {
  try {
    const response = await axiosInstance.delete(`${API_URL}/chat/${conversationId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting conversation:', error)
    throw error
  }
}

// ----------------------------------------------------------------------

export async function searchConversations(userId: string, query: string) {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/chat/search?user_id=${userId}&q=${encodeURIComponent(query)}`
    )
    return response.data
  } catch (error) {
    console.error('Error searching conversations:', error)
    throw error
  }
}

// ----------------------------------------------------------------------

// Utility function to refresh conversations list
export function refreshConversations(userId?: string, page = 1, limit = 20, type?: string, search?: string) {
  if (userId) {
    const params = new URLSearchParams()
    params.append('user_id', userId)
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (type) params.append('type', type)
    if (search) params.append('search', search)
    
    mutate(`${API_URL}/chat?${params.toString()}`)
  }
}

// Utility function to refresh specific conversation
export function refreshConversation(conversationId?: string) {
  if (conversationId) {
    mutate(`${API_URL}/chat/${conversationId}`)
  }
}

// Utility function to add new conversation to cache
export function addConversationToCache(userId: string, newConversation: IConversationItem) {
  const params = new URLSearchParams()
  params.append('user_id', userId)
  params.append('page', '1')
  params.append('limit', '20')
  
  const cacheKey = `${API_URL}/chat?${params.toString()}`
  
  mutate(cacheKey, (currentData: any) => {
    if (!currentData) return currentData
    
    return {
      ...currentData,
      data: [newConversation, ...currentData.data]
    }
  }, { revalidate: false })
}

// Utility function to update conversation in cache
export function updateConversationInCache(userId: string, conversationId: string, updates: Partial<IConversationItem>) {
  const params = new URLSearchParams()
  params.append('user_id', userId)
  params.append('page', '1')
  params.append('limit', '20')
  
  const cacheKey = `${API_URL}/chat?${params.toString()}`
  
  mutate(cacheKey, (currentData: any) => {
    if (!currentData) return currentData
    
    return {
      ...currentData,
      data: currentData.data.map((conv: IConversationItem) => 
        conv.id === conversationId ? { ...conv, ...updates } : conv
      )
    }
  }, { revalidate: false })
}

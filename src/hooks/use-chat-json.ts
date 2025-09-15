import { useState, useCallback } from 'react'
import axios from 'axios'
import {
  ChatJsonResponse,
  ChatJsonRequest,
  JsonResponseType
} from 'src/types/chat'

const API_URL = import.meta.env.VITE_API_URL

export interface UseChatJsonOptions {
  onSuccess?: (response: ChatJsonResponse) => void
  onError?: (error: Error) => void
}

export const useChatJson = (options?: UseChatJsonOptions) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendJsonMessage = useCallback(
    async (
      conversationId: string,
      message: string,
      userId: string,
      requestOptions?: {
        jsonResponseType?: JsonResponseType
        imageUrls?: string[]
        model?: string
      }
    ): Promise<ChatJsonResponse | null> => {
      setLoading(true)
      setError(null)

      try {
        const payload: ChatJsonRequest = {
          message,
          user_id: userId,
          requireJsonResponse: true,
          ...requestOptions
        }

        const response = await axios.post(
          `${API_URL}/chat/${conversationId}/json`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
          }
        )
        // eslint-disable-next-line prefer-destructuring
        const data: ChatJsonResponse = response.data

        if (!data.success) {
          throw new Error(data.reply || 'API returned error')
        }

        options?.onSuccess?.(data)
        return data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        options?.onError?.(err instanceof Error ? err : new Error(errorMessage))
        return null
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    sendJsonMessage,
    loading,
    error,
    clearError
  }
}

// Helper function to validate JSON response
export const validateJsonResponse = (response: ChatJsonResponse): boolean => {
  if (!response.success) {
    console.error('API returned error:', response)
    return false
  }

  if (response.jsonData && !response.jsonData.type) {
    console.error('Invalid JSON data structure:', response.jsonData)
    return false
  }

  return true
}

// Helper function to extract specific data type from JSON response
export const extractJsonData = <T>(
  response: ChatJsonResponse,
  expectedType: JsonResponseType
): T | null => {
  if (!response.jsonData || response.jsonData.type !== expectedType) {
    return null
  }

  return response.jsonData.data as T
}

// Helper function to check if response contains appointment suggestion
export const hasAppointmentSuggestion = (
  response: ChatJsonResponse
): boolean =>
  response.jsonData?.type === 'appointment_suggestion' &&
  (response.jsonData.data as any)?.suggested === true

// Helper function to check if response contains appointment info
export const hasAppointmentInfo = (response: ChatJsonResponse): boolean =>
  response.jsonData?.type === 'appointment_info' &&
  (response.jsonData.data as any)?.hasAppointment === true

// Helper function to check if response contains symptom analysis
export const hasSymptomAnalysis = (response: ChatJsonResponse): boolean =>
  response.jsonData?.type === 'symptom_analysis'

// Helper function to check if response contains patient info
export const hasPatientInfo = (response: ChatJsonResponse): boolean =>
  response.jsonData?.type === 'patient_info' &&
  (response.jsonData.data as any)?.hasInfo === true

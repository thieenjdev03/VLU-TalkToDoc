# Frontend - Backend Integration Guide

## 1. API Integration Structure

### API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Add response interceptor
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Handle token refresh
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await apiClient.post('/auth/refresh', {
            refreshToken
          })
          localStorage.setItem('token', response.data.token)
          return apiClient(error.config)
        } catch (refreshError) {
          // Handle refresh token failure
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)
```

### API Endpoints Definition

```typescript
// src/api/endpoints.ts
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout'
  },

  // Chat
  chat: {
    create: '/chat',
    sendMessage: (chatId: string) => `/chat/${chatId}`,
    getHistory: (chatId: string) => `/chat/${chatId}`
  },

  // Appointments
  appointments: {
    getAll: '/appointments',
    create: '/appointments',
    updateStatus: (id: string) => `/appointments/${id}`,
    getById: (id: string) => `/appointments/${id}`
  },

  // Users
  users: {
    getAll: '/users',
    getProfile: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`
  },

  // Video Call
  video: {
    getToken: '/video/token',
    createRoom: '/video/room'
  }
}
```

### API Services

```typescript
// src/api/services/auth.service.ts
import { apiClient } from '../client'
import { API_ENDPOINTS } from '../endpoints'

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, {
      email,
      password
    })
    return response.data
  },

  register: async (userData: any) => {
    const response = await apiClient.post(API_ENDPOINTS.auth.register, userData)
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.auth.logout)
    return response.data
  }
}

// src/api/services/chat.service.ts
export const chatService = {
  createChat: async (userId: string) => {
    const response = await apiClient.post(API_ENDPOINTS.chat.create, { userId })
    return response.data
  },

  sendMessage: async (chatId: string, message: string, userId: string) => {
    const response = await apiClient.post(
      API_ENDPOINTS.chat.sendMessage(chatId),
      {
        message,
        userId
      }
    )
    return response.data
  },

  getHistory: async (chatId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.chat.getHistory(chatId))
    return response.data
  }
}
```

## 2. Type Definitions

### Shared Types

```typescript
// src/types/shared.ts
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: {
    code: string
    message: string
  }
}

export interface PaginationParams {
  page: number
  limit: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

### DTO Types

```typescript
// src/types/dtos.ts
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  fullName: string
  email: string
  password: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  phoneNumber: string
  address: string
  specialty?: string
}

export interface CreateAppointmentDto {
  patientId: string
  doctorId: string
  date: string
  slot: string
  totalFee: number
}
```

## 3. State Management Integration

### Zustand Store with API

```typescript
// src/store/chat.store.ts
import { create } from 'zustand'
import { chatService } from '../api/services/chat.service'
import { IChatMessage, IChatConversation } from '../types/chat'

interface ChatState {
  conversations: IChatConversation[]
  currentConversation: IChatConversation | null
  messages: IChatMessage[]
  isLoading: boolean
  error: string | null

  // Actions
  createChat: (userId: string) => Promise<void>
  sendMessage: (
    chatId: string,
    message: string,
    userId: string
  ) => Promise<void>
  getHistory: (chatId: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  createChat: async (userId: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await chatService.createChat(userId)
      set(state => ({
        conversations: [...state.conversations, response.data],
        currentConversation: response.data
      }))
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  sendMessage: async (chatId: string, message: string, userId: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await chatService.sendMessage(chatId, message, userId)
      set(state => ({
        messages: [...state.messages, response.data]
      }))
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  getHistory: async (chatId: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await chatService.getHistory(chatId)
      set({ messages: response.data })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  }
}))
```

## 4. Environment Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_STRINGEE_KEY=your_stringee_key
```

### Configuration Module

```typescript
// src/config/index.ts
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL
  },
  stringee: {
    key: process.env.NEXT_PUBLIC_STRINGEE_KEY
  }
}
```

## 5. Error Handling

### Error Types

```typescript
// src/types/errors.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

### Error Handler

```typescript
// src/utils/error-handler.ts
import { ApiError, ValidationError } from '../types/errors'

export const handleError = (error: unknown) => {
  if (error instanceof ApiError) {
    // Handle API errors
    switch (error.status) {
      case 401:
        // Handle unauthorized
        break
      case 403:
        // Handle forbidden
        break
      case 404:
        // Handle not found
        break
      default:
      // Handle other errors
    }
  } else if (error instanceof ValidationError) {
    // Handle validation errors
  } else {
    // Handle unknown errors
  }
}
```

## 6. WebSocket Integration

### WebSocket Client

```typescript
// src/api/websocket.ts
import { config } from '../config'

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(private onMessage: (data: any) => void) {}

  connect() {
    this.ws = new WebSocket(config.api.wsUrl)

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = event => {
      const data = JSON.parse(event.data)
      this.onMessage(data)
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.reconnect()
    }

    this.ws.onerror = error => {
      console.error('WebSocket error:', error)
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts)
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
```

## 7. Testing Integration

### API Mock Setup

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.post('/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          token: 'mock-token',
          user: {
            id: '1',
            email: 'test@example.com'
          }
        }
      })
    )
  }),

  rest.get('/chat/:chatId', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          messages: []
        }
      })
    )
  })
]
```

### Test Setup

```typescript
// src/setupTests.ts
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

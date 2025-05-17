import { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore'
import { db } from 'src/firebase/firebase-config'

interface Message {
  id?: string
  senderId: string
  content: string
  timestamp?: any
  type?: 'text' | 'image' | 'file'
}

export function useFirebaseChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  // Gửi tin nhắn
  const sendMessage = useCallback(
    async (message: Omit<Message, 'timestamp'>) => {
      if (!conversationId) return
      await addDoc(
        collection(db, 'conversations', conversationId, 'messages'),
        {
          ...message,
          timestamp: serverTimestamp()
        }
      )
    },
    [conversationId]
  )

  // Lắng nghe tin nhắn realtime
  useEffect(() => {
    if (!conversationId) return

    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const newMessages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      setMessages(newMessages)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [conversationId])

  return { messages, loading, sendMessage }
}

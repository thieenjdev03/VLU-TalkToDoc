import { useRef, useState, useEffect, useCallback } from 'react'
import {
  query,
  addDoc,
  orderBy,
  collection,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import {
  Box,
  Stack,
  Paper,
  TextField,
  Typography,
  IconButton
} from '@mui/material'

import { db } from 'src/firebase/firebase-config'

interface Message {
  id?: string
  from: string
  to: string
  content: string
  time: string
}

interface CallChatBoxProps {
  currentUser: string
  peerUser: string
  appointmentId: string
  userInfor: any
}

function CallChatBox({
  currentUser,
  peerUser,
  appointmentId,
  userInfor
}: CallChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Tạo conversationId duy nhất cho cuộc trò chuyện (không phụ thuộc vào role)
  const conversationId = [currentUser, peerUser].sort().join('_')

  useEffect(() => {
    if (!conversationId) return

    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs: Message[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          from: data.from,
          fromName: data.fromName,
          to: data.to,
          content: data.content,
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          time: data.timestamp
            ? new Date(data.timestamp.toDate()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })
            : ''
        }
      })
      setMessages(msgs)
    })
  }, [conversationId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Upload ảnh lên Cloudinary
  async function uploadImageToCloudinary(file: File): Promise<string | null> {
    const url = 'https://api.cloudinary.com/v1_1/dut4zlbui/image/upload'
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'talktodoc_unsigned')
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.secure_url || null
    } catch (err) {
      return null
    }
  }

  // Xử lý upload ảnh
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target
    if (!files || files.length === 0) return
    setIsUploading(true)
    const uploadPromises = Array.from(files).map(file =>
      uploadImageToCloudinary(file)
    )
    const uploadedUrls = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as string[]
    setImageUrls(prev => [...prev, ...uploadedUrls])
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSend = useCallback(async () => {
    if ((!input.trim() && imageUrls.length === 0) || isSending) return
    setIsSending(true)
    try {
      await addDoc(
        collection(db, 'conversations', conversationId, 'messages'),
        {
          from: currentUser,
          ...(peerUser && { to: peerUser }),
          fromName: userInfor?.fullName || 'Bạn',
          content: input.trim(),
          ...(imageUrls.length > 0 ? { imageUrls } : {}),
          timestamp: serverTimestamp()
        }
      )
      setInput('')
      setImageUrls([])
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err)
    }
    setIsSending(false)
  }, [
    input,
    imageUrls,
    currentUser,
    peerUser,
    conversationId,
    isSending,
    userInfor
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 500,
        minWidth: 400,
        height: '100%',
        minHeight: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        bgcolor: 'background.paper',
        zIndex: 10
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Chat với {userInfor?.fullName || 'Người dùng'}
      </Typography>
      <Box
        sx={{
          mb: 1,
          pr: 1,
          flex: 1,
          overflowY: 'auto',
          maxHeight: 600
        }}
      >
        <Stack spacing={1}>
          {messages.map((msg: any) => (
            <Box
              key={msg.id}
              sx={{
                alignSelf: msg.from === currentUser ? 'flex-end' : 'flex-start',
                bgcolor: msg.from === currentUser ? 'primary.main' : 'grey.300',
                color:
                  msg.from === currentUser
                    ? 'primary.contrastText'
                    : 'text.primary',
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                maxWidth: '80%'
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
              {/* Hiển thị ảnh nếu có */}
              {msg.imageUrls && msg.imageUrls.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {msg?.imageUrls?.map((url: any) => (
                    <img
                      key={url}
                      src={url}
                      alt="chat-img"
                      style={{
                        maxWidth: 120,
                        borderRadius: 8,
                        display: 'block'
                      }}
                      loading="lazy"
                    />
                  ))}
                </Box>
              )}
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {msg.time}
              </Typography>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>
      {/* Hiển thị preview ảnh trước khi gửi */}
      {imageUrls.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          {imageUrls.map(url => (
            <Box key={url} sx={{ position: 'relative' }}>
              <img
                src={url}
                alt="preview"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 6
                }}
              />
            </Box>
          ))}
        </Box>
      )}
      <Box display="flex" gap={1} sx={{ mt: 1 }}>
        <IconButton component="label" disabled={isUploading || isSending}>
          <ImageIcon />
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            disabled={isUploading || isSending}
          />
        </IconButton>
        <TextField
          fullWidth
          size="small"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || isUploading}
          inputProps={{ maxLength: 500 }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={
            isSending ||
            isUploading ||
            (!input.trim() && imageUrls.length === 0)
          }
          aria-label="Gửi tin nhắn"
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  )
}

export default CallChatBox

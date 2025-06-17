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
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Stack,
  Paper,
  Dialog,
  useTheme,
  TextField,
  Typography,
  IconButton,
  DialogContent,
  useMediaQuery
} from '@mui/material'
import { db } from 'src/firebase/firebase-config'

interface Message {
  id?: string
  from: string
  to: string
  content: string
  time: string
  imageUrls?: string[]
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
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  console.log('appointmentId:', appointmentId)
  useEffect(() => {
    if (!appointmentId) return undefined

    const q = query(
      collection(db, 'conversations', appointmentId, 'messages'),
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

    return unsubscribe
  }, [appointmentId])

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
      await addDoc(collection(db, 'conversations', appointmentId, 'messages'), {
        from: currentUser,
        ...(peerUser && { to: peerUser }),
        fromName: userInfor?.fullName || 'Bạn',
        content: input.trim(),
        ...(imageUrls.length > 0 ? { imageUrls } : {}),
        timestamp: serverTimestamp()
      })
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
    appointmentId,
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

  // Xử lý mở preview ảnh
  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setIsPreviewOpen(true)
  }

  // Đóng preview ảnh
  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewImage(null)
  }

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          maxWidth: { xs: '100%', md: 500 },
          minWidth: { xs: '100%', md: 400 },
          height: '100%',
          minHeight: { xs: 400, md: '100%' },
          p: { xs: 1, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          bgcolor: 'background.paper',
          zIndex: 10
        }}
      >
        <Typography
          variant={isMobile ? 'body1' : 'subtitle1'}
          fontWeight={600}
          gutterBottom
        >
          Chat với {userInfor?.role === 'DOCTOR' ? 'Bệnh Nhân' : 'Bác sĩ'}
        </Typography>
        <Box
          sx={{
            mb: 1,
            pr: { xs: 0.5, sm: 1 },
            flex: 1,
            overflowY: 'auto',
            maxHeight: { xs: 400, md: 580 }
          }}
        >
          <Stack spacing={1}>
            {messages.map((msg: any) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf:
                    msg.from === currentUser ? 'flex-end' : 'flex-start',
                  bgcolor:
                    msg.from === currentUser ? 'primary.main' : 'grey.300',
                  color:
                    msg.from === currentUser
                      ? 'primary.contrastText'
                      : 'text.primary',
                  px: { xs: 1, sm: 1.5 },
                  py: { xs: 0.5, sm: 1 },
                  borderRadius: 1.5,
                  maxWidth: '80%'
                }}
              >
                <Typography variant={isMobile ? 'caption' : 'body2'}>
                  {msg.content}
                </Typography>
                {msg.imageUrls && msg.imageUrls.length > 0 && (
                  <Box
                    sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  >
                    {msg?.imageUrls?.map((url: any, index: number) => (
                      <Box
                        key={url}
                        sx={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                        onClick={() => handleImageClick(url)}
                      >
                        <img
                          src={url}
                          alt={`chat-img-${index}`}
                          style={{
                            maxWidth: isMobile ? 80 : 120,
                            borderRadius: 8,
                            display: 'block'
                          }}
                          loading="lazy"
                        />
                      </Box>
                    ))}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.6,
                    fontSize: isMobile ? '0.65rem' : '0.75rem'
                  }}
                >
                  {msg.time}
                </Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>
        {imageUrls.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mb: 1,
              flexWrap: 'wrap'
            }}
          >
            {imageUrls.map((url, index) => (
              <Box
                key={url}
                sx={{
                  position: 'relative',
                  width: isMobile ? 40 : 60,
                  height: isMobile ? 40 : 60,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
                onClick={() => handleImageClick(url)}
              >
                <img
                  src={url}
                  alt={`preview-${index}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 6
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
          <IconButton
            component="label"
            disabled={isUploading || isSending}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              width: isMobile ? 30 : 40,
              height: isMobile ? 30 : 40
            }}
          >
            <ImageIcon fontSize={isMobile ? 'small' : 'medium'} />
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
            size={isMobile ? 'small' : 'medium'}
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending || isUploading}
            inputProps={{ maxLength: 500 }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: isMobile ? '0.875rem' : '1rem'
              }
            }}
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
            size={isMobile ? 'small' : 'medium'}
          >
            <SendIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Box>
      </Paper>

      {/* Image Preview Modal */}
      <Dialog
        open={isPreviewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: 'none',
            boxShadow: 'none'
          }
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '60vh',
            bgcolor: 'transparent'
          }}
        >
          <IconButton
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          {previewImage && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                p: 2
              }}
            >
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 8
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CallChatBox

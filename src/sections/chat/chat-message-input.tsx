import PropTypes from 'prop-types'
import { useRef, useState, ChangeEvent } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import MicIcon from '@mui/icons-material/Mic'
import ImageIcon from '@mui/icons-material/Image'
import SendIcon from '@mui/icons-material/Send'
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  CircularProgress
} from '@mui/material'

interface Props {
  onSendMessage: (message: string, imageUrls?: string[]) => void
  onUploadImage?: (file: File) => void
  onVoiceChat?: () => void
  disabled?: boolean
}

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

export default function ChatMessageInput({
  onSendMessage,
  onUploadImage,
  onVoiceChat,
  disabled
}: Props) {
  const [message, setMessage] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!message.trim() && imageUrls.length === 0) return
    onSendMessage(message.trim(), imageUrls)
    setMessage('')
    setImageUrls([])
    setUploadError(null)
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend()
    }
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (!files || files.length === 0) return
    setIsUploading(true)
    setUploadError(null)
    const uploadPromises = Array.from(files).map(file =>
      uploadImageToCloudinary(file)
    )
    const uploadedUrls = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as string[]
    if (uploadedUrls.length === 0) {
      setUploadError('Tải ảnh lên thất bại. Vui lòng thử lại.')
      setIsUploading(false)
      return
    }
    setImageUrls(prev => [...prev, ...uploadedUrls])
    if (onUploadImage) Array.from(files).forEach(file => onUploadImage(file))
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveImage = (url: string) => {
    setImageUrls(prev => prev.filter(u => u !== url))
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: '4px 6px', sm: '6px 8px', md: '8px 12px' },
        display: 'flex',
        alignItems: 'center',
        borderRadius: { xs: '24px', sm: '28px', md: '32px' },
        m: { xs: 0.5, sm: 1, md: 2 },
        minHeight: { xs: 44, sm: 48, md: 56 }
      }}
    >
      <IconButton 
        component="label" 
        disabled={disabled || isUploading}
        size="small"
        sx={{ 
          display: { xs: 'none', sm: 'flex' },
          width: { xs: 32, sm: 36, md: 40 },
          height: { xs: 32, sm: 36, md: 40 }
        }}
      >
        <ImageIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleImageUpload}
          disabled={disabled || isUploading}
          multiple
        />
      </IconButton>

      <Box sx={{ 
        ml: { xs: 0.5, sm: 1 }, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <InputBase
          sx={{ 
            flex: 1, 
            minWidth: 0,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
          placeholder="Nhập tin nhắn..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyUp={handleKeyUp}
          disabled={disabled || isUploading}
        />
        {imageUrls.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            {imageUrls.map(url => (
              <Box
                key={url}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={url}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(url)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: 'rgba(255,255,255,0.7)'
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
        {isUploading && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <span style={{ fontSize: 13, color: '#888' }}>Đang tải ảnh...</span>
          </Box>
        )}
        {uploadError && (
          <Box sx={{ mt: 1, color: 'red', fontSize: 13 }}>{uploadError}</Box>
        )}
      </Box>

      {onVoiceChat && (
        <IconButton
          onClick={onVoiceChat}
          disabled={disabled || isUploading}
          size="small"
          sx={{ 
            ml: { xs: 0.5, sm: 1 },
            color: 'primary.main',
            width: { xs: 32, sm: 36, md: 40 },
            height: { xs: 32, sm: 36, md: 40 },
            '&:hover': {
              backgroundColor: 'primary.lighter'
            }
          }}
          title="Voice Chat"
        >
          <MicIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
        </IconButton>
      )}
      
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={
          (!message.trim() && imageUrls.length === 0) || disabled || isUploading
        }
        size="small"
        sx={{ 
          ml: { xs: 0.5, sm: 1 },
          width: { xs: 32, sm: 36, md: 40 },
          height: { xs: 32, sm: 36, md: 40 }
        }}
      >
        <SendIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
      </IconButton>
    </Paper>
  )
}

ChatMessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onUploadImage: PropTypes.func,
  onVoiceChat: PropTypes.func,
  disabled: PropTypes.bool
}

import PropTypes from 'prop-types'
import { useRef, useState, ChangeEvent } from 'react'

import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import CloseIcon from '@mui/icons-material/Close'
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
        p: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '32px',
        m: 2
      }}
    >
      <IconButton component="label" disabled={disabled || isUploading}>
        <ImageIcon />
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

      <Box sx={{ ml: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <InputBase
          sx={{ flex: 1, minWidth: 0 }}
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

      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={
          (!message.trim() && imageUrls.length === 0) || disabled || isUploading
        }
        sx={{ ml: 1 }}
      >
        <SendIcon />
      </IconButton>
    </Paper>
  )
}

ChatMessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onUploadImage: PropTypes.func,
  disabled: PropTypes.bool
}

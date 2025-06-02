import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import {
  Box,
  Stack,
  Avatar,
  Dialog,
  Typography,
  IconButton
} from '@mui/material'

import { CloseIcon } from 'src/components/lightbox'

import { IChatMessage } from 'src/types/chat'

interface Props {
  message: IChatMessage & { imageUrls?: string[] }
  isCurrentUser: boolean
  userProfile: any
}

// Hàm kiểm tra xem chuỗi có phải là URL hình ảnh không
function isImageUrl(content: string) {
  if (!content) return false
  return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(content)
}

// Hàm tách nội dung thành phần text và mảng image nếu có nhiều ảnh
function splitContent(content: string) {
  if (!content) return { text: content, images: [] }
  // Tìm tất cả URL hình ảnh trong nội dung
  const imageRegex = /(https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|webp))/gi
  const images = content.match(imageRegex) || []
  // Loại bỏ tất cả imageUrl khỏi text
  let text = content
  images.forEach(url => {
    text = text.replace(url, '').trim()
  })
  return { text, images }
}

function ImagePreviewDialog({
  open,
  onClose,
  url
}: {
  open: boolean
  onClose: () => void
  url: string
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <IconButton
        onClick={onClose}
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          minWidth: 300,
          p: 2
        }}
        onClick={onClose}
      >
        <img
          src={url}
          alt="preview"
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            borderRadius: 12,
            boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
            background: '#fff'
          }}
        />
      </Box>
    </Dialog>
  )
}

export default function ChatMessageItem({
  message,
  isCurrentUser,
  userProfile
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const userAvatar =
    userProfile?.avatarUrl && typeof userProfile.avatarUrl === 'string'
      ? userProfile.avatarUrl
      : '/assets/images/avatar/avatar_default.jpg'

  // Ưu tiên lấy imageUrls từ message nếu có
  const imageUrls = Array.isArray(message.imageUrls) ? message.imageUrls : []
  // Nếu không có imageUrls, tách ảnh từ content
  const { text, images } = splitContent(message.content)
  const allImages = imageUrls.length > 0 ? imageUrls : images

  const handleImageClick = (url: string) => {
    setPreviewUrl(url)
  }

  const handleClosePreview = () => {
    setPreviewUrl(null)
  }

  return (
    <Stack
      direction="row"
      justifyContent={isCurrentUser ? 'flex-end' : 'flex-start'}
      alignItems="flex-start"
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      {!isCurrentUser && (
        <Avatar
          src="https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/owwf4irzl8hu1dm2e3ux.png"
          alt="TalkToDoc A.I"
          sx={{ width: 36, height: 36 }}
        />
      )}

      <Box maxWidth="70%">
        {!isCurrentUser && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}
          >
            TalkToDoc A.I
          </Typography>
        )}

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: isCurrentUser ? 'primary.main' : '#e5f0fc',
            color: isCurrentUser ? '#fff' : '#000',
            wordBreak: 'break-word',
            fontSize: 14,
            fontWeight: 400,
            boxShadow: 1
          }}
        >
          {text && (
            <ReactMarkdown
              children={text}
              components={{
                p: ({ children }) => (
                  <Box component="p" sx={{ mb: 1 }}>
                    {children}
                  </Box>
                ),
                strong: ({ children }) => (
                  <Box
                    component="strong"
                    sx={{ fontWeight: 600, display: 'inline' }}
                  >
                    {children}
                  </Box>
                ),
                h3: ({ children }) => (
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mt: 2, mb: 1 }}
                  >
                    {children}
                  </Typography>
                ),
                li: ({ children }) => (
                  <Box component="li" sx={{ ml: 2, mb: 0.5 }}>
                    {children}
                  </Box>
                )
              }}
            />
          )}
          {/* Hiển thị tất cả hình ảnh nếu có */}
          {allImages.length > 0 && (
            <Box
              mt={text ? 1 : 0}
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
            >
              {allImages.map(url => (
                <Box
                  key={url}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                  onClick={() => handleImageClick(url)}
                >
                  <img
                    src={url}
                    alt="chat-img"
                    style={{ maxWidth: 120, borderRadius: 8, display: 'block' }}
                    loading="lazy"
                  />
                </Box>
              ))}
            </Box>
          )}
          {/* Nếu không tách được thì fallback về kiểm tra là ảnh đơn lẻ */}
          {!text && allImages.length === 0 && isImageUrl(message.content) && (
            <Box
              sx={{
                cursor: 'pointer',
                display: 'inline-block',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' }
              }}
              onClick={() => handleImageClick(message.content)}
            >
              <img
                src={message.content}
                alt="chat-img"
                style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
                loading="lazy"
              />
            </Box>
          )}
        </Box>
      </Box>

      {isCurrentUser && (
        <Avatar src={userAvatar} alt="You" sx={{ width: 36, height: 36 }} />
      )}

      {/* Dialog preview ảnh */}
      {previewUrl && (
        <ImagePreviewDialog
          open={!!previewUrl}
          onClose={handleClosePreview}
          url={previewUrl}
        />
      )}
    </Stack>
  )
}

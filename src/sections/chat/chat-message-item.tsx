import { Box, Stack, Avatar, Typography } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import { IChatMessage } from 'src/types/chat'
import { db } from 'src/firebase/firebase-config'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy
} from 'firebase/firestore'

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

export default function ChatMessageItem({
  message,
  isCurrentUser,
  userProfile
}: Props) {
  const userAvatar =
    userProfile?.avatarUrl && typeof userProfile.avatarUrl === 'string'
      ? userProfile.avatarUrl
      : '/assets/images/avatar/avatar_default.jpg'

  // Ưu tiên lấy imageUrls từ message nếu có
  const imageUrls = Array.isArray(message.imageUrls) ? message.imageUrls : []
  // Nếu không có imageUrls, tách ảnh từ content
  const { text, images } = splitContent(message.content)
  const allImages = imageUrls.length > 0 ? imageUrls : images

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
                <img
                  key={url}
                  src={url}
                  alt="chat-img"
                  style={{ maxWidth: 120, borderRadius: 8, display: 'block' }}
                  loading="lazy"
                />
              ))}
            </Box>
          )}
          {/* Nếu không tách được thì fallback về kiểm tra là ảnh đơn lẻ */}
          {!text && allImages.length === 0 && isImageUrl(message.content) && (
            <img
              src={message.content}
              alt="chat-img"
              style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }}
              loading="lazy"
            />
          )}
        </Box>
      </Box>

      {isCurrentUser && (
        <Avatar src={userAvatar} alt="You" sx={{ width: 36, height: 36 }} />
      )}
    </Stack>
  )
}

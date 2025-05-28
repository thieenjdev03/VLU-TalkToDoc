import PropTypes from 'prop-types'
import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'
import { useRouter, useSearchParams } from 'src/routes/hooks'

import { createChat, useGetChat, sendMessageToAI } from 'src/api/chat'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs'

import ChatMessageInput from '../chat-message-input'
import ChatHeaderDetail from '../chat-header-detail'
import { useChatHistory } from '../hooks/use-chat-history'
import ChatMessageList, { BotTypingIndicator } from '../chat-message-list'

// ----------------------------------------------------------------------

function EmptyChatStart({
  onStart,
  isLoading
}: {
  onStart: () => void
  isLoading: boolean
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        height: '100%',
        width: '100%',
        minHeight: { xs: 480, sm: 520 },
        background: theme =>
          `linear-gradient(180deg, ${theme.palette.primary.lighter} 0%, #fff 100%)`
      }}
    >
      <Box
        sx={{
          width: 220,
          height: 220,
          position: 'relative',
          mb: 3
        }}
      >
        {/* Bubble 1 (big, blue) */}
        <Box
          sx={{
            position: 'absolute',
            left: 32,
            top: 40,
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: theme => theme.palette.primary.main,
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 48,
              userSelect: 'none'
            }}
          >
            <img
              src="https://res.cloudinary.com/dut4zlbui/image/upload/v1747242764/uvntlgv6nti7st6ftsae.png"
              alt="logo"
              width={80}
              height={80}
            />
          </Typography>
        </Box>
        {/* Bubble 2 (small, pink) */}
        <Box
          sx={{
            position: 'absolute',
            left: 110,
            top: 80,
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: theme => theme.palette.success.main,
            boxShadow: '0 4px 16px 0 rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 32,
              userSelect: 'none'
            }}
          >
            💬
          </Typography>
        </Box>
        {/* Decorative dots */}
        <Box
          sx={{
            position: 'absolute',
            left: 60,
            top: 20,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: theme => theme.palette.primary.light,
            opacity: 0.7
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: 170,
            top: 60,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: theme => theme.palette.secondary.light,
            opacity: 0.7
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: 100,
            top: 150,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: theme => theme.palette.primary.light,
            opacity: 0.5
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: 150,
            top: 130,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: theme => theme.palette.secondary.light,
            opacity: 0.5
          }}
        />
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 1,
          textAlign: 'center'
        }}
      >
        Chào mừng đến với Chat AI
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          maxWidth: 260,
          mb: 3
        }}
      >
        Trò chuyện với AI, chia sẻ hình ảnh và tệp tin nhanh chóng, chất lượng
        cao.
      </Typography>
      {/* Dots indicator */}
      <Stack direction="row" spacing={1} mb={3}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: theme => theme.palette.primary.main,
            opacity: 0.8
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: theme => theme.palette.primary.main,
            opacity: 0.3
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: theme => theme.palette.primary.main,
            opacity: 0.3
          }}
        />
      </Stack>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={onStart}
        sx={{
          minWidth: 160,
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 16,
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)'
        }}
        disabled={isLoading}
      >
        Bắt đầu trò chuyện
      </Button>
    </Stack>
  )
}

EmptyChatStart.propTypes = {
  onStart: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
}

export default function ChatView() {
  const router = useRouter()
  const user = JSON.parse(localStorage.getItem('userProfile') || '{}')
  const settings = useSettingsContext()
  const searchParams = useSearchParams()

  const selectedConversationId = searchParams.get('id') || ''
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startingChat, setStartingChat] = useState(false)

  const { conversationError } = useGetChat(selectedConversationId)
  const { messages, addMessages, clearHistory } = useChatHistory(
    selectedConversationId
  )
  console.log('messages', messages)
  useEffect(() => {
    if (conversationError) {
      router.push(paths.dashboard.chat)
    }
  }, [conversationError, router])

  // Hàm khởi tạo chat và gửi tin nhắn đầu tiên
  const handleStartChat = useCallback(async () => {
    setStartingChat(true)
    setError(null)
    try {
      // Tạo cuộc trò chuyện mới
      const newChat = await createChat(user?._id || '')
      // Gửi tin nhắn đầu tiên mặc định
      const firstMessage = 'Xin chào, tôi cần sự trợ giúp?'
      setIsBotTyping(true)
      const response = await sendMessageToAI(
        newChat._id,
        firstMessage,
        user?.id || ''
      )
      addMessages(response.messages)
      router.push(`${paths.dashboard.chat}?id=${newChat._id}`)
    } catch (err) {
      setError('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.')
    } finally {
      setStartingChat(false)
      setIsBotTyping(false)
    }
  }, [router, user, addMessages])

  const handleSendMessage = async (message: string, imageUrls?: string[]) => {
    try {
      setError(null)

      if (!selectedConversationId) {
        setStartingChat(true)
        try {
          const newChat = await createChat(user?._id || '')
          setIsBotTyping(true)
          addMessages([
            {
              _id: Date.now().toString(),
              role: 'user',
              content: message,
              imageUrls: imageUrls || []
            }
          ] as any)
          const response = await sendMessageToAI(
            newChat._id,
            message,
            user?.id || '',
            imageUrls
          )
          // Thêm tin nhắn assistant vào state
          addMessages([
            {
              _id: `${Date.now()?.toString()}_bot`,
              role: 'assistant',
              content: response.reply,
              imageUrls: []
            }
          ] as any)
          router.push(`${paths.dashboard.chat}?id=${newChat._id}`)
        } catch (err) {
          setError('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.')
        } finally {
          setStartingChat(false)
          setIsBotTyping(false)
        }
        return
      }

      setIsBotTyping(true)
      // Thêm tin nhắn user vào state ngay lập tức
      addMessages([
        {
          _id: Date.now().toString(),
          role: 'user',
          content: message,
          imageUrls: imageUrls || []
        }
      ] as any)
      // Gửi lên API, chỉ nhận reply
      const response = await sendMessageToAI(
        selectedConversationId,
        message,
        user?._id || '',
        imageUrls
      )
      // Thêm tin nhắn assistant vào state
      addMessages([
        {
          _id: `${Date.now()?.toString()}_bot`,
          role: 'assistant',
          content: response.reply,
          imageUrls: []
        }
      ] as any)
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
    } finally {
      setIsBotTyping(false)
    }
  }

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{
        pr: 1,
        pl: 2.5,
        py: 1,
        minHeight: 72,
        backgroundColor: 'primary.main'
      }}
    >
      <ChatHeaderDetail />

      <Stack flexGrow={1} />
    </Stack>
  )

  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden'
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error}
        </Alert>
      )}

      <ChatMessageList messages={messages} userProfile={user} />

      {isBotTyping && (
        <Box sx={{ px: 2, py: 1 }}>
          <BotTypingIndicator />
        </Box>
      )}

      <ChatMessageInput
        onSendMessage={handleSendMessage}
        disabled={startingChat}
      />
    </Stack>
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Chat với AI"
        links={[
          { name: 'Trang quản trị', href: paths.dashboard.root },
          {
            name: 'Chat với AI'
          }
        ]}
        sx={{
          mb: { xs: 1, md: 2 }
        }}
      />

      <Stack
        component={Card}
        sx={{ height: '80vh', position: 'relative', overflow: 'hidden' }}
      >
        {renderHead}

        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: 'hidden',
            borderTop: theme => `solid 1px ${theme.palette.divider}`,
            position: 'relative'
          }}
        >
          {!selectedConversationId ? (
            <EmptyChatStart
              onStart={handleStartChat}
              isLoading={startingChat}
            />
          ) : (
            renderMessages
          )}
          {/* Bỏ loading overlay, chỉ giữ trạng thái khởi tạo chat */}
          {startingChat && (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                background: 'rgba(255,255,255,0.7)'
              }}
            >
              <Typography variant="body2" color="text.secondary" mt={2}>
                Đang khởi tạo cuộc trò chuyện...
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Container>
  )
}

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
import { 
  addConversationToCache,
  markConversationAsRead, 
  refreshConversations,
  updateConversationInCache,
  useGetConversations
} from 'src/api/conversation'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs'

import ChatMessageInput from '../chat-message-input'
import ChatHeaderDetail from '../chat-header-detail'
import { useChatHistory } from '../hooks/use-chat-history'
import ChatConversationSidebar from '../chat-conversation-sidebar'
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
  const { messages, addMessages } = useChatHistory(
    selectedConversationId
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [conversationType] = useState<string | undefined>()
  
  const { 
    conversations, 
    conversationsLoading, 
    pagination,
    conversationsError 
  } = useGetConversations(user?._id, currentPage, 20, conversationType, searchQuery)
  console.log('messages', messages)
  useEffect(() => {
    if (conversationError) {
      router.push(paths.dashboard.chat)
    }
  }, [conversationError, router])

  // Refresh conversations khi user thay đổi
  useEffect(() => {
    if (user?._id) {
      refreshConversations(user._id, currentPage, 20, conversationType, searchQuery)
    }
  }, [user?._id, currentPage, conversationType, searchQuery])

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

  // Function to detect appointment keywords
  const shouldTriggerAppointmentSuggestion = (message: string): boolean => {
    const appointmentKeywords = [
      'test',           // Test keyword
      'khám',           // Khám bệnh
      'lịch hẹn',       // Đặt lịch hẹn
      'đặt lịch',       // Đặt lịch
      'bác sĩ',         // Tìm bác sĩ
      'tư vấn',         // Tư vấn y tế
      'triệu chứng',    // Có triệu chứng
      'đau',            // Đau đớn
      'sốt',            // Sốt
      'ho',             // Ho
      'mệt mỏi',        // Mệt mỏi
      'tái khám',       // Tái khám
      'khám lại',       // Khám lại
      'hẹn lại',        // Hẹn lại
      'lịch tái khám',  // Lịch tái khám
      'khi nào khám',   // Hỏi lịch khám
      'bao giờ khám',   // Hỏi thời gian khám
      'có cần khám',    // Hỏi có cần khám không
      'có nên khám'     // Hỏi có nên khám không
    ]
    
    const lowerMessage = message.toLowerCase()
    return appointmentKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // Function to detect follow-up appointment keywords
  const shouldTriggerFollowUpSuggestion = (message: string): boolean => {
    const followUpKeywords = [
      'tái khám', 'khám lại', 'hẹn lại', 'lịch tái khám',
      'khi nào khám', 'bao giờ khám', 'có cần khám', 'có nên khám'
    ]
    const lowerMessage = message.toLowerCase()
    return followUpKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // Function to detect urgency level
  const detectUrgency = (message: string): 'normal' | 'urgent' | 'emergency' => {
    const urgentKeywords = ['khẩn cấp', 'gấp', 'ngay', 'cấp cứu']
    const emergencyKeywords = ['cấp cứu', 'nguy hiểm', 'tình trạng xấu']
    
    const lowerMessage = message.toLowerCase()
    
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'emergency'
    }
    
    if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'urgent'
    }
    
    return 'normal'
  }

  // Function to extract symptoms from message
  const extractSymptoms = (message: string): string[] => {
    const symptoms: string[] = []
    const lowerMessage = message.toLowerCase()
    
    const symptomKeywords = {
      'đau đầu': ['đau đầu', 'nhức đầu'],
      'sốt': ['sốt', 'nóng'],
      'ho': ['ho', 'cough'],
      'mệt mỏi': ['mệt mỏi', 'mệt', 'yếu'],
      'đau bụng': ['đau bụng', 'đau dạ dày'],
      'khó thở': ['khó thở', 'thở khó'],
      'chóng mặt': ['chóng mặt', 'hoa mắt']
    }
    
    Object.entries(symptomKeywords).forEach(([symptom, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        symptoms.push(symptom)
      }
    })
    
    return symptoms
  }

  const handleSendMessage = async (message: string, imageUrls?: string[]) => {
    try {
      setError(null)

      // Detect if should suggest appointment
      const shouldSuggest = shouldTriggerAppointmentSuggestion(message)
      const isFollowUp = shouldTriggerFollowUpSuggestion(message)
      const symptoms = extractSymptoms(message)
      const urgency = detectUrgency(message)

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
          
          // Gửi với options để trigger appointment suggestion
          const response = await sendMessageToAI(
            newChat._id,
            message,
            user?.id || '',
            imageUrls,
            {
              suggestAppointment: shouldSuggest,
              isFollowUpAppointment: isFollowUp,
              userSymptoms: symptoms,
              urgency: urgency
            }
          )
          
          // Thêm tin nhắn assistant vào state
          addMessages([
            {
              _id: `${Date.now()?.toString()}_bot`,
              role: 'assistant',
              content: response.reply,
              imageUrls: [],
              appointmentSuggestion: response.appointmentSuggestion
            }
          ] as any)
          
          // Cập nhật sidebar với conversation mới
          if (user?._id) {
            const newConversation = {
              id: newChat._id,
              title: (newChat as any).title || 'Cuộc trò chuyện mới',
              lastMessage: response.reply,
              updatedAt: new Date().toISOString(),
              unread: false,
              model_used: (newChat as any).model_used || 'gpt-4o-mini',
              type: 'ai' as const,
              unread_count: 0,
              created_at: new Date().toISOString(),
              user_id: user._id
            }
            addConversationToCache(user._id, newConversation)
          }
          
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
      
      // Gửi lên API với options để trigger appointment suggestion
      const response = await sendMessageToAI(
        selectedConversationId,
        message,
        user?._id || '',
        imageUrls,
        {
          suggestAppointment: shouldSuggest,
          isFollowUpAppointment: isFollowUp,
          userSymptoms: symptoms,
          urgency: urgency
        }
      )
      
      // Thêm tin nhắn assistant vào state
      addMessages([
        {
          _id: `${Date.now()?.toString()}_bot`,
          role: 'assistant',
          content: response.reply,
          imageUrls: [],
          appointmentSuggestion: response.appointmentSuggestion
        }
      ] as any)
      
      // Cập nhật sidebar với tin nhắn mới
      if (user?._id) {
        updateConversationInCache(user._id, selectedConversationId, {
          lastMessage: response.reply,
          updatedAt: new Date().toISOString(),
          unread: false // Không unread vì user đang chat
        })
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
    } finally {
      setIsBotTyping(false)
    }
  }

  const handleAppointmentAccept = (appointmentId: string) => {
    console.log('Appointment accepted:', appointmentId)
    // Có thể thêm logic thông báo thành công hoặc chuyển hướng
  }

  const handleAppointmentReject = () => {
    console.log('Appointment rejected')
    // Có thể thêm logic thông báo từ chối
  }

  const handleConversationSelect = async (conversationId: string) => {
    try {
      // Đánh dấu đã đọc
      await markConversationAsRead(conversationId)
      
      // Cập nhật cache để đánh dấu đã đọc
      if (user?._id) {
        updateConversationInCache(user._id, conversationId, {
          unread: false,
          unread_count: 0,
          updatedAt: new Date().toISOString()
        })
      }
      
      // Chuyển đến conversation
      router.push(`${paths.dashboard.chat}?id=${conversationId}`)
    } catch (err) {
      console.error('Error selecting conversation:', err)
    }
  }

  const handleNewChat = () => {
    router.push(paths.dashboard.chat)
  }

  const handleLoadMore = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  // const handleTypeFilter = (type: string | undefined) => {
  //   setConversationType(type)
  //   setCurrentPage(1) // Reset to first page when filtering
  // }

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

      {conversationsError && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại.
        </Alert>
      )}

      <ChatMessageList 
        messages={messages} 
        userProfile={user}
        onAppointmentAccept={handleAppointmentAccept}
        onAppointmentReject={handleAppointmentReject}
      />

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
        <Stack direction="row" sx={{ height: 1 }}>
          {/* Sidebar */}
          <ChatConversationSidebar
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={handleConversationSelect}
            onNewChat={handleNewChat}
            loading={conversationsLoading}
            pagination={pagination}
            onLoadMore={handleLoadMore}
            hasMore={pagination ? currentPage < pagination.totalPages : false}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />

          {/* Main Chat Area */}
          <Stack sx={{ flex: 1, height: 1 }}>
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
        </Stack>
      </Stack>
    </Container>
  )
}

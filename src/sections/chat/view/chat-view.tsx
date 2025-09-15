import PropTypes from 'prop-types'
import { useState, useEffect, useCallback } from 'react'

import {
  Box,
  Alert,
  Stack,
  Button,
  DialogActions,
  DialogContent,
  Typography,
  Card,
  Container,
  Dialog,
  DialogTitle,
  IconButton
} from '@mui/material'

import { paths } from 'src/routes/paths'
import { useRouter, useSearchParams } from 'src/routes/hooks'

import { VoiceChatMock } from 'src/features/voice'
import {
  createChat,
  useGetChat,
  sendMessageToAI,
  sendJsonMessageToAI
} from 'src/api/chat'
import {
  useGetConversations,
  refreshConversations,
  addConversationToCache,
  markConversationAsRead,
  updateConversationInCache
} from 'src/api/conversation'

import Iconify from 'src/components/iconify'
import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs'

import ChatMessageInput from '../chat-message-input'
import ChatHeaderDetail from '../chat-header-detail'
import { useChatHistory } from '../hooks/use-chat-history'
import ChatConversationSidebar from '../chat-conversation-sidebar'
import ChatMessageList, { BotTypingIndicator } from '../chat-message-list'
import {
  ChatMiniOptions,
  ChatMiniOptionsCompact
} from '../components/chat-mini-options'

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
        minHeight: { xs: 300, sm: 400, md: 480 },
        background: theme =>
          `linear-gradient(180deg, ${theme.palette.primary.lighter} 0%, #fff 100%)`,
        px: { xs: 2, sm: 3 }
      }}
    >
      <Box
        sx={{
          width: { xs: 160, sm: 180, md: 220 },
          height: { xs: 160, sm: 180, md: 220 },
          position: 'relative',
          mb: { xs: 2, sm: 3 }
        }}
      >
        {/* Bubble 1 (big, blue) */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: 24, sm: 28, md: 32 },
            top: { xs: 30, sm: 35, md: 40 },
            width: { xs: 80, sm: 90, md: 110 },
            height: { xs: 80, sm: 90, md: 110 },
            borderRadius: '50%',
            background: theme => theme.palette.primary.main,
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <img
            src="https://res.cloudinary.com/dut4zlbui/image/upload/v1747242764/uvntlgv6nti7st6ftsae.png"
            alt="logo"
            style={{
              width: '60%',
              height: '60%',
              objectFit: 'contain'
            }}
          />
        </Box>
        {/* Bubble 2 (small, pink) */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: 80, sm: 90, md: 110 },
            top: { xs: 60, sm: 70, md: 80 },
            width: { xs: 50, sm: 60, md: 70 },
            height: { xs: 50, sm: 60, md: 70 },
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
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: { xs: 20, sm: 24, md: 32 },
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
          textAlign: 'center',
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
        }}
      >
        Chào mừng đến với Chat AI
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          maxWidth: { xs: 280, sm: 320, md: 360 },
          mb: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 0 },
          fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' }
        }}
      >
        Trò chuyện với AI, chia sẻ hình ảnh và tệp tin nhanh chóng, chất lượng
        cao.
      </Typography>
      {/* Dots indicator */}
      <Stack direction="row" spacing={1} mb={{ xs: 2, sm: 3 }}>
        <Box
          sx={{
            width: { xs: 6, sm: 8 },
            height: { xs: 6, sm: 8 },
            borderRadius: '50%',
            background: theme => theme.palette.primary.main,
            opacity: 0.8
          }}
        />
        <Box
          sx={{
            width: { xs: 6, sm: 8 },
            height: { xs: 6, sm: 8 },
            borderRadius: '50%',
            background: theme => theme.palette.primary.main,
            opacity: 0.3
          }}
        />
        <Box
          sx={{
            width: { xs: 6, sm: 8 },
            height: { xs: 6, sm: 8 },
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
          minWidth: { xs: 140, sm: 160 },
          borderRadius: 999,
          fontWeight: 600,
          fontSize: { xs: 14, sm: 16 },
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
          px: { xs: 3, sm: 4 }
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
  const { messages, addMessages } = useChatHistory(selectedConversationId)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [conversationType] = useState<string | undefined>()
  const [showVoiceChatDialog, setShowVoiceChatDialog] = useState(false)
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false)

  const {
    conversations,
    conversationsLoading,
    pagination,
    conversationsError
  } = useGetConversations(
    user?._id,
    currentPage,
    20,
    conversationType,
    searchQuery
  )
  console.log('messages', messages)
  useEffect(() => {
    if (conversationError) {
      router.push(paths.dashboard.chat)
    }
  }, [conversationError, router])

  // Refresh conversations khi user thay đổi
  useEffect(() => {
    if (user?._id) {
      refreshConversations(
        user._id,
        currentPage,
        20,
        conversationType,
        searchQuery
      )
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
      'test', // Test keyword
      'khám', // Khám bệnh
      'lịch hẹn', // Đặt lịch hẹn
      'đặt lịch', // Đặt lịch
      'bác sĩ', // Tìm bác sĩ
      'tư vấn', // Tư vấn y tế
      'triệu chứng', // Có triệu chứng
      'đau', // Đau đớn
      'sốt', // Sốt
      'ho', // Ho
      'mệt mỏi', // Mệt mỏi
      'tái khám', // Tái khám
      'khám lại', // Khám lại
      'hẹn lại', // Hẹn lại
      'lịch tái khám', // Lịch tái khám
      'khi nào khám', // Hỏi lịch khám
      'bao giờ khám', // Hỏi thời gian khám
      'có cần khám', // Hỏi có cần khám không
      'có nên khám' // Hỏi có nên khám không
    ]

    const lowerMessage = message.toLowerCase()
    return appointmentKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // Function to detect follow-up appointment keywords
  const shouldTriggerFollowUpSuggestion = (message: string): boolean => {
    const followUpKeywords = [
      'tái khám',
      'khám lại',
      'hẹn lại',
      'lịch tái khám',
      'khi nào khám',
      'bao giờ khám',
      'có cần khám',
      'có nên khám'
    ]
    const lowerMessage = message.toLowerCase()
    return followUpKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // Function to detect urgency level
  const detectUrgency = (
    message: string
  ): 'normal' | 'urgent' | 'emergency' => {
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
      sốt: ['sốt', 'nóng'],
      ho: ['ho', 'cough'],
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

  // Function to detect if message needs JSON response
  const shouldUseJsonResponse = (
    message: string
  ): { useJson: boolean; jsonType?: string } => {
    const lowerMessage = message.toLowerCase()

    // Appointment info keywords
    const appointmentInfoKeywords = [
      'lịch hẹn của tôi',
      'kiểm tra lịch hẹn',
      'lịch hẹn khi nào',
      'có lịch hẹn',
      'lịch hẹn sắp tới',
      'lịch hẹn gần đây'
    ]

    // Appointment suggestion keywords
    const appointmentSuggestionKeywords = [
      'đặt lịch',
      'đặt lịch khám',
      'muốn khám',
      'cần khám',
      'tư vấn bác sĩ',
      'hẹn bác sĩ',
      'đặt hẹn'
    ]

    // Symptom analysis keywords
    const symptomAnalysisKeywords = [
      'đau',
      'sốt',
      'ho',
      'mệt mỏi',
      'triệu chứng',
      'bệnh',
      'cảm thấy',
      'có vấn đề',
      'không khỏe'
    ]

    // Patient info keywords
    const patientInfoKeywords = [
      'thông tin cá nhân',
      'hồ sơ bệnh án',
      'thông tin của tôi',
      'tiền sử bệnh',
      'dị ứng'
    ]

    if (
      appointmentInfoKeywords.some(keyword => lowerMessage.includes(keyword))
    ) {
      return { useJson: true, jsonType: 'appointment_info' }
    }

    if (
      appointmentSuggestionKeywords.some(keyword =>
        lowerMessage.includes(keyword)
      )
    ) {
      return { useJson: true, jsonType: 'appointment_suggestion' }
    }

    if (
      symptomAnalysisKeywords.some(keyword => lowerMessage.includes(keyword))
    ) {
      return { useJson: true, jsonType: 'symptom_analysis' }
    }

    if (patientInfoKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { useJson: true, jsonType: 'patient_info' }
    }

    return { useJson: false }
  }

  const handleSendMessage = useCallback(
    async (message: string, imageUrls?: string[]) => {
      try {
        setError(null)

        // Detect if should suggest appointment
        const shouldSuggest = shouldTriggerAppointmentSuggestion(message)
        const isFollowUp = shouldTriggerFollowUpSuggestion(message)
        const symptoms = extractSymptoms(message)
        const urgency = detectUrgency(message)

        // Check if should use JSON response
        const jsonResponse = shouldUseJsonResponse(message)

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

            // Gửi message với JSON response nếu cần
            let response: any
            if (jsonResponse.useJson) {
              response = await sendJsonMessageToAI(
                newChat._id,
                message,
                user?.id || '',
                imageUrls,
                jsonResponse.jsonType
              )
            } else {
              response = await sendMessageToAI(
                newChat._id,
                message,
                user?.id || '',
                imageUrls,
                {
                  suggestAppointment: shouldSuggest,
                  isFollowUpAppointment: isFollowUp,
                  userSymptoms: symptoms,
                  urgency
                }
              )
            }

            // Thêm tin nhắn assistant vào state
            addMessages([
              {
                _id: `${Date.now()?.toString()}_bot`,
                role: 'assistant',
                content: response.reply,
                imageUrls: [],
                appointmentSuggestion: response.appointmentSuggestion,
                jsonData: response.jsonData
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

        // Gửi message với JSON response nếu cần
        let response: any
        if (jsonResponse.useJson) {
          response = await sendJsonMessageToAI(
            selectedConversationId,
            message,
            user?._id || '',
            imageUrls,
            jsonResponse.jsonType
          )
        } else {
          response = await sendMessageToAI(
            selectedConversationId,
            message,
            user?._id || '',
            imageUrls,
            {
              suggestAppointment: shouldSuggest,
              isFollowUpAppointment: isFollowUp,
              userSymptoms: symptoms,
              urgency
            }
          )
        }

        // Thêm tin nhắn assistant vào state
        addMessages([
          {
            _id: `${Date.now()?.toString()}_bot`,
            role: 'assistant',
            content: response.reply,
            imageUrls: [],
            appointmentSuggestion: response.appointmentSuggestion,
            jsonData: response.jsonData
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
    },
    [selectedConversationId, user, addMessages, router]
  )

  const handleAppointmentAccept = (appointmentId: string) => {
    console.log('Appointment accepted:', appointmentId)
    // Có thể thêm logic thông báo thành công hoặc chuyển hướng
  }

  const handleAppointmentReject = () => {
    console.log('Appointment rejected')
    // Có thể thêm logic thông báo từ chối
  }

  // Handle mini option selection
  const handleMiniOptionSelect = useCallback(
    (option: any) => {
      console.log('Mini option selected:', option)
      handleSendMessage(option.message)
    },
    [handleSendMessage]
  )

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

  const handleVoiceChat = () => {
    setShowVoiceChatDialog(true)
  }

  const handleConfirmVoiceChat = () => {
    setShowVoiceChatDialog(false)
    setIsVoiceChatMode(true)
  }

  const handleCancelVoiceChat = () => {
    setShowVoiceChatDialog(false)
  }

  const handleExitVoiceChat = () => {
    setIsVoiceChatMode(false)
  }

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{
        pr: { xs: 1, sm: 2 },
        pl: { xs: 1, sm: 2 },
        py: { xs: 0.5, sm: 1 },
        minHeight: { xs: 48, sm: 56, md: 64 },
        backgroundColor: 'primary.main',
        position: 'relative'
      }}
    >
      {isVoiceChatMode ? (
        <>
          <IconButton
            onClick={handleExitVoiceChat}
            size="small"
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <Iconify icon="solar:arrow-left-bold" width={20} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              ml: { xs: 1, sm: 2 },
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Voice Chat Mode
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              ml: { xs: 1, sm: 2 },
              fontWeight: 600,
              display: { xs: 'block', sm: 'none' }
            }}
          >
            Voice
          </Typography>
        </>
      ) : (
        <>
          <ChatHeaderDetail />
          <Stack flexGrow={1} />
        </>
      )}
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

      {/* Mini Options & Suggestions */}
      <Box
        sx={{
          px: { xs: 1, sm: 2 },
          pb: { xs: 0.5, sm: 1 },
          width: '100%',
          display: {
            xs:
              selectedConversationId && messages.length > 0 ? 'none' : 'block',
            sm: 'block'
          }
        }}
      >
        {!selectedConversationId || messages.length === 0 ? (
          <ChatMiniOptions
            onOptionSelect={handleMiniOptionSelect}
            disabled={startingChat || isBotTyping}
            showCategories
            enableSearch
          />
        ) : (
          <ChatMiniOptionsCompact
            onOptionSelect={handleMiniOptionSelect}
            disabled={startingChat || isBotTyping}
          />
        )}
      </Box>

      <ChatMessageInput
        onSendMessage={handleSendMessage}
        onVoiceChat={handleVoiceChat}
        disabled={startingChat}
      />
    </Stack>
  )

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{
        pb: 0
      }}
    >
      <CustomBreadcrumbs
        heading="Chat với AI"
        links={[
          { name: 'Trang quản trị', href: paths.dashboard.root },
          {
            name: 'Chat với AI'
          }
        ]}
        sx={{
          mb: { xs: 0.5, sm: 1, md: 2 },
          display: { xs: 'none', sm: 'block' }, // Ẩn breadcrumb trên mobile để tiết kiệm không gian
          px: { xs: 1, sm: 0 }
        }}
      />

      <Stack
        component={Card}
        sx={{
          height: {
            xs: 'calc(100vh - 60px)',
            sm: 'calc(100vh - 80px)',
            md: 'calc(100vh - 100px)',
            lg: '80vh'
          },
          pb: 0,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: 0, sm: 1, md: 2 },
          boxShadow: { xs: 'none', sm: 1 }
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} sx={{ height: 1 }}>
          {/* Sidebar - Hidden in Voice Chat Mode */}
          {!isVoiceChatMode && (
            <Box
              sx={{
                width: { xs: '100%', lg: 320 },
                height: { xs: 'auto', lg: '100%' },
                maxHeight: { xs: '40vh', lg: 'none' },
                borderRight: { xs: 'none', lg: 1 },
                borderBottom: { xs: 1, lg: 'none' },
                borderColor: 'divider',
                display: {
                  xs: selectedConversationId ? 'none' : 'block',
                  lg: 'block'
                }
              }}
            >
              <ChatConversationSidebar
                conversations={conversations}
                selectedId={selectedConversationId}
                onSelect={handleConversationSelect}
                onNewChat={handleNewChat}
                loading={conversationsLoading}
                pagination={pagination}
                onLoadMore={handleLoadMore}
                hasMore={
                  pagination ? currentPage < pagination.totalPages : false
                }
                onSearch={handleSearch}
                searchQuery={searchQuery}
              />
            </Box>
          )}

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
              {isVoiceChatMode ? (
                <VoiceChatMock
                  onBack={handleExitVoiceChat}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <>
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
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* Voice Chat Confirmation Dialog */}
      <Dialog
        open={showVoiceChatDialog}
        onClose={handleCancelVoiceChat}
        maxWidth="sm"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            p: { xs: 2, sm: 1 },
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: { xs: 4, sm: 2 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
          >
            <Iconify
              icon="solar:microphone-bold"
              width={{ xs: 20, sm: 24 }}
              sx={{ color: 'primary.main' }}
            />
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              Trò chuyện bằng giọng nói cùng AI
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            textAlign: 'center',
            py: { xs: 1, sm: 2 },
            px: { xs: 3, sm: 4 }
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            mb={{ xs: 2, sm: 3 }}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Bạn có muốn chuyển sang chế độ trò chuyện bằng giọng nói với AI
            không?
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2 }}
            justifyContent="center"
            mb={{ xs: 2, sm: 3 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'grey.50'
              }}
            >
              <Iconify
                icon="solar:voice-bold"
                width={20}
                sx={{ color: 'primary.main' }}
              />
              <Typography variant="body2" fontWeight={500}>
                Giao tiếp tự nhiên
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'grey.50'
              }}
            >
              <Iconify
                icon="solar:soundwave-bold"
                width={20}
                sx={{ color: 'primary.main' }}
              />
              <Typography variant="body2" fontWeight={500}>
                Nhiều giọng nói
              </Typography>
            </Box>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            *Đây là bản mock UI – không thu âm/ gửi dữ liệu thật.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            gap: { xs: 1, sm: 2 },
            pb: { xs: 4, sm: 3 },
            px: { xs: 3, sm: 4 },
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCancelVoiceChat}
            fullWidth={false}
            sx={{
              minWidth: { xs: '100%', sm: 120 },
              borderRadius: 2,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmVoiceChat}
            fullWidth={false}
            sx={{
              minWidth: { xs: '100%', sm: 120 },
              borderRadius: 2,
              backgroundColor: 'primary.main',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

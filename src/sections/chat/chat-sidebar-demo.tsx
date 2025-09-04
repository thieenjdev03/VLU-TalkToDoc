import { useState } from 'react'

import {
  Box,
  Card,
  Stack,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material'

import { 
  useGetConversations, 
  addConversationToCache, 
  updateConversationInCache 
} from 'src/api/conversation'

import ChatConversationSidebar, { ConversationItem } from './chat-conversation-sidebar'

// ----------------------------------------------------------------------

const mockConversations: ConversationItem[] = [
  {
    id: 'conv_001',
    title: 'AI - gpt-4o-mini',
    lastMessage: 'Bạn nhớ uống nhiều nước và nghỉ ngơi đầy đủ nhé. Nếu có triệu chứng gì bất thường, hãy liên hệ ngay.',
    updatedAt: '2024-01-20T18:00:00Z',
    unread: true,
    model_used: 'gpt-4o-mini',
    type: 'ai',
    avatar: 'https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/owwf4irzl8hu1dm2e3ux.png'
  },
  {
    id: 'conv_002',
    title: 'Bác sĩ Lan',
    lastMessage: 'Lần sau khám lại sau 1 tháng. Nhớ mang theo kết quả xét nghiệm.',
    updatedAt: '2024-01-19T11:02:00Z',
    unread: false,
    model_used: 'doctor',
    type: 'doctor',
    avatar: 'https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/doctor_avatar.jpg'
  },
  {
    id: 'conv_003',
    title: 'AI - gpt-4o',
    lastMessage: 'Dựa trên triệu chứng bạn mô tả, tôi khuyên bạn nên đặt lịch hẹn với bác sĩ chuyên khoa Tim mạch.',
    updatedAt: '2024-01-18T14:30:00Z',
    unread: true,
    model_used: 'gpt-4o',
    type: 'ai'
  },
  {
    id: 'conv_004',
    title: 'Bác sĩ Minh',
    lastMessage: 'Thuốc đã được kê đơn. Uống đúng liều lượng và thời gian như hướng dẫn.',
    updatedAt: '2024-01-17T09:15:00Z',
    unread: false,
    model_used: 'doctor',
    type: 'doctor',
    avatar: 'https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/doctor_avatar2.jpg'
  },
  {
    id: 'conv_005',
    title: 'AI - gpt-3.5-turbo',
    lastMessage: 'Cảm ơn bạn đã chia sẻ thông tin. Tôi đã ghi nhận và sẽ theo dõi tình trạng của bạn.',
    updatedAt: '2024-01-16T16:45:00Z',
    unread: false,
    model_used: 'gpt-3.5-turbo',
    type: 'ai'
  },
  {
    id: 'conv_006',
    title: 'Bác sĩ Hương',
    lastMessage: 'Kết quả xét nghiệm bình thường. Bạn có thể yên tâm và tiếp tục theo dõi.',
    updatedAt: '2024-01-15T13:20:00Z',
    unread: true,
    model_used: 'doctor',
    type: 'doctor',
    avatar: 'https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/doctor_avatar3.jpg'
  }
]

export default function ChatSidebarDemo() {
  const [selectedId, setSelectedId] = useState<string>('conv_001')
  const [loading, setLoading] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)
  const [useRealAPI, setUseRealAPI] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  // Real API data
  const { 
    conversations: realConversations, 
    conversationsLoading, 
    pagination,
    conversationsError 
  } = useGetConversations('test_user', currentPage, 10, undefined, searchQuery)

  const handleSelect = (conversationId: string) => {
    setSelectedId(conversationId)
    console.log('Selected conversation:', conversationId)
  }

  const handleNewChat = () => {
    console.log('New chat clicked')
    setSelectedId('')
  }

  const handleToggleLoading = () => {
    setLoading(!loading)
  }

  const handleToggleEmpty = () => {
    setShowEmpty(!showEmpty)
  }

  const handleToggleRealAPI = () => {
    setUseRealAPI(!useRealAPI)
    setCurrentPage(1)
    setSearchQuery('')
  }

  const handleLoadMore = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleAddMockConversation = () => {
    const newConversation: ConversationItem = {
      id: `conv_mock_${Date.now()}`,
      title: 'AI - gpt-4o (Mock)',
      lastMessage: 'Đây là tin nhắn mới được thêm vào sidebar!',
      updatedAt: new Date().toISOString(),
      unread: true,
      model_used: 'gpt-4o',
      type: 'ai',
      unread_count: 1,
      created_at: new Date().toISOString(),
      user_id: 'test_user'
    }
    
    if (useRealAPI) {
      addConversationToCache('test_user', newConversation)
    } else {
      // For mock mode, just add to local state
      console.log('Mock conversation added:', newConversation)
    }
  }

  const handleUpdateMockConversation = () => {
    if (selectedId) {
      const updates = {
        lastMessage: 'Tin nhắn đã được cập nhật!',
        updatedAt: new Date().toISOString(),
        unread: false,
        unread_count: 0
      }
      
      if (useRealAPI) {
        updateConversationInCache('test_user', selectedId, updates)
      } else {
        console.log('Mock conversation updated:', selectedId, updates)
      }
    }
  }

  const conversations = showEmpty 
    ? [] 
    : (useRealAPI ? realConversations : mockConversations)
  const isLoading = useRealAPI ? conversationsLoading : loading

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Demo: Chat Conversation Sidebar
      </Typography>

      {/* Controls */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Demo Controls
        </Typography>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
          <FormControlLabel
            control={<Switch checked={useRealAPI} onChange={handleToggleRealAPI} />}
            label="Use Real API"
          />
          <FormControlLabel
            control={<Switch checked={loading} onChange={handleToggleLoading} disabled={useRealAPI} />}
            label="Loading State"
          />
          <FormControlLabel
            control={<Switch checked={showEmpty} onChange={handleToggleEmpty} />}
            label="Empty State"
          />
          <Button
            variant="outlined"
            onClick={() => setSelectedId('conv_002')}
            disabled={showEmpty}
          >
            Select Conv 002
          </Button>
          <Button
            variant="outlined"
            onClick={() => setSelectedId('')}
          >
            Clear Selection
          </Button>
          <Button
            variant="contained"
            onClick={handleAddMockConversation}
            disabled={showEmpty}
          >
            Add Mock Conversation
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateMockConversation}
            disabled={!selectedId || showEmpty}
          >
            Update Selected
          </Button>
        </Stack>
      </Card>

      {/* Sidebar Demo */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sidebar Component
        </Typography>
        <Box sx={{ height: 600, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <ChatConversationSidebar
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
            loading={isLoading}
            pagination={useRealAPI ? pagination : undefined}
            onLoadMore={useRealAPI ? handleLoadMore : undefined}
            hasMore={useRealAPI 
              ? (pagination ? currentPage < pagination.totalPages : false) 
              : false}
            onSearch={useRealAPI ? handleSearch : undefined}
            searchQuery={useRealAPI ? searchQuery : undefined}
          />
        </Box>
      </Card>

      {/* Information */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Thông tin Demo
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Conversation được chọn:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedId || 'Không có'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tổng số conversations:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {useRealAPI ? (pagination?.total || 0) : conversations.length}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Conversations chưa đọc:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {conversations.filter(c => c.unread).length}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tính năng đã implement:
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                ✅ Search conversations (Backend + Client-side)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Filter by type (AI/Doctor)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Unread indicator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Model chip display
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Responsive design
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Loading & empty states
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ New chat button
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Pagination & Load more
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Real API integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Real-time sidebar updates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Cache management
              </Typography>
            </Stack>
          </Box>

          {useRealAPI && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  API Status:
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" color={conversationsError ? 'error.main' : 'success.main'}>
                    {conversationsError ? '❌ API Error' : '✅ API Connected'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Page: {currentPage}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Search Query: {searchQuery || 'None'}
                  </Typography>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </Card>
    </Box>
  )
}

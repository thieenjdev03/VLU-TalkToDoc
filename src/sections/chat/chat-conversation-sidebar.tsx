import { useMemo, useState } from 'react'

import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import { useResponsive } from 'src/hooks/use-responsive'
import { fDateTime } from 'src/utils/format-time'

import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

export interface IConversationItem {
  id: string
  title: string
  lastMessage: string
  updatedAt: string
  unread: boolean
  model_used: string
  type: 'ai' | 'doctor'
  avatar?: string
  participantCount?: number
  unread_count?: number
  created_at?: string
  user_id?: string
}

interface Props {
  conversations: IConversationItem[]
  selectedId?: string
  onSelect: (conversationId: string) => void
  onNewChat?: () => void
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onLoadMore?: () => void
  hasMore?: boolean
  onSearch?: (query: string) => void
  searchQuery?: string
}

export default function ChatConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  loading = false,
  pagination,
  onLoadMore,
  hasMore = false,
  onSearch,
  searchQuery = ''
}: Props) {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Use backend search if onSearch is provided, otherwise use local filtering
  const filteredConversations = useMemo(() => {
    if (onSearch) {
      // Backend search - return conversations as is
      return conversations
    }
    
    // Client-side filtering fallback
    if (!localSearch.trim()) return conversations

    const searchLower = localSearch.toLowerCase()
    return conversations.filter(
      (conversation) =>
        conversation.title.toLowerCase().includes(searchLower) ||
        conversation.lastMessage.toLowerCase().includes(searchLower) ||
        conversation.model_used.toLowerCase().includes(searchLower)
    )
  }, [conversations, localSearch, onSearch])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const getModelChipColor = (model: string, type: string) => {
    if (type === 'doctor') return 'success'
    if (model.includes('gpt-4o')) return 'primary'
    if (model.includes('gpt-3.5')) return 'secondary'
    return 'default'
  }

  const getModelLabel = (model: string, type: string) => {
    if (type === 'doctor') return 'Bác sĩ'
    if (model === 'gpt-4o') return 'GPT-4o'
    if (model === 'gpt-4o-mini') return 'GPT-4o Mini'
    if (model === 'gpt-3.5-turbo') return 'GPT-3.5'
    return model
  }

  const getAvatarSrc = (conversation: IConversationItem) => {
    if (conversation.avatar) return conversation.avatar
    if (conversation.type === 'doctor') {
      return 'https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/doctor_avatar.jpg'
    }
    return 'https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/owwf4irzl8hu1dm2e3ux.png'
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 280, md: 320 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        borderBottom: (theme) => `1px solid ${theme.palette.divider}` 
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Cuộc trò chuyện
          </Typography>
          <Tooltip title="Tạo cuộc trò chuyện mới">
            <IconButton
              onClick={onNewChat}
              size="small"
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              <Iconify icon="eva:plus-fill" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm cuộc trò chuyện..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: localSearch && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => handleSearchChange('')}
                  sx={{ width: 20, height: 20 }}
                >
                  <Iconify icon="eva:close-fill" width={14} />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.neutral',
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
              '&:hover': {
                backgroundColor: 'background.neutral'
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper'
              }
            }
          }}
        />
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {loading && (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, index) => (
              <ConversationItemSkeleton key={index} />
            ))}
          </Box>
        )}

        {!loading && filteredConversations.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3,
              textAlign: 'center'
            }}
          >
            <Iconify
              icon="eva:message-circle-outline"
              width={64}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {localSearch ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
            </Typography>
            {!localSearch && onNewChat && (
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ cursor: 'pointer', mt: 1 }}
                onClick={onNewChat}
              >
                Tạo cuộc trò chuyện đầu tiên
              </Typography>
            )}
          </Box>
        )}

        {!loading && filteredConversations.length > 0 && (
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            {filteredConversations.map((conversation, index) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onClick={() => onSelect(conversation.id)}
                getModelChipColor={getModelChipColor}
                getModelLabel={getModelLabel}
                getAvatarSrc={getAvatarSrc}
              />
            ))}

            {/* Load More Button */}
            {hasMore && onLoadMore && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onLoadMore}
                  disabled={loading}
                  sx={{ width: '100%' }}
                >
                  {loading ? 'Đang tải...' : 'Tải thêm'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

// ----------------------------------------------------------------------

interface ConversationItemComponentProps {
  conversation: IConversationItem
  isSelected: boolean
  onClick: () => void
  getModelChipColor: (model: string, type: string) => 'success' | 'primary' | 'secondary' | 'default'
  getModelLabel: (model: string, type: string) => string
  getAvatarSrc: (conversation: IConversationItem) => string
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
  getModelChipColor,
  getModelLabel,
  getAvatarSrc
}: ConversationItemComponentProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: { xs: 1.5, sm: 2 },
        cursor: 'pointer',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: isSelected ? 'primary.lighter' : 'transparent',
        borderLeft: conversation.unread ? '3px solid' : '3px solid transparent',
        borderLeftColor: conversation.unread ? 'primary.main' : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: isSelected ? 'primary.lighter' : 'background.neutral'
        }
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                width: { xs: 10, sm: 12 },
                height: { xs: 10, sm: 12 },
                borderRadius: '50%',
                backgroundColor: conversation.type === 'doctor' ? 'success.main' : 'primary.main',
                border: '2px solid',
                borderColor: 'background.paper'
              }}
            />
          }
        >
          <Avatar
            src='https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/owwf4irzl8hu1dm2e3ux.png'            alt={conversation.title}
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
          />
        </Badge>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? 'primary.darker' : 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.875rem', sm: '0.9rem' }
              }}
            >
              {conversation.title}
            </Typography>
            {conversation.unread && (
              <Box
                sx={{
                  width: { xs: 6, sm: 8 },
                  height: { xs: 6, sm: 8 },
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  flexShrink: 0
                }}
              />
            )}
          </Stack>

          <Chip
            label={getModelLabel(conversation.model_used, conversation.type)}
            size="small"
            color={getModelChipColor(conversation.model_used, conversation.type)}
            variant="outlined"
            sx={{ 
              mb: 1, 
              height: { xs: 18, sm: 20 }, 
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: { xs: 1, sm: 2 },
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {conversation.lastMessage}
          </Typography>

          <Typography 
            variant="caption" 
            color="text.disabled"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          >
            {fDateTime(conversation.updatedAt)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}

// ----------------------------------------------------------------------

function ConversationItemSkeleton() {
  return (
    <Box sx={{ p: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'background.neutral'
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              width: '60%',
              height: 16,
              backgroundColor: 'background.neutral',
              borderRadius: 1,
              mb: 1
            }}
          />
          <Box
            sx={{
              width: '40%',
              height: 20,
              backgroundColor: 'background.neutral',
              borderRadius: 1,
              mb: 1
            }}
          />
          <Box
            sx={{
              width: '100%',
              height: 14,
              backgroundColor: 'background.neutral',
              borderRadius: 1,
              mb: 0.5
            }}
          />
          <Box
            sx={{
              width: '30%',
              height: 12,
              backgroundColor: 'background.neutral',
              borderRadius: 1
            }}
          />
        </Box>
      </Stack>
    </Box>
  )
}

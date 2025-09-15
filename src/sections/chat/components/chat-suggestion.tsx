import React from 'react'

import { Refresh as RefreshIcon } from '@mui/icons-material'
import {
  Box,
  Chip,
  Paper,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'

import Iconify from 'src/components/iconify'

export interface ChatSuggestionItem {
  id: string
  label: string
  message: string
}

interface ChatSuggestionProps {
  onSelect: (message: string) => void
  disabled?: boolean
  suggestions?: ChatSuggestionItem[]
  title?: string
}

const DEFAULT_SUGGESTIONS: ChatSuggestionItem[] = [
  { id: 'sugg_1', label: 'Đặt lịch khám', message: 'Tôi muốn đặt lịch khám bệnh' },
  { id: 'sugg_2', label: 'Triệu chứng đau đầu', message: 'Tôi bị đau đầu và mệt mỏi nhiều ngày' },
  { id: 'sugg_3', label: 'Kiểm tra lịch hẹn', message: 'Tôi muốn kiểm tra lịch hẹn của mình' },
  { id: 'sugg_4', label: 'Thông tin bác sĩ', message: 'Hãy gợi ý bác sĩ phù hợp với triệu chứng của tôi' },
  { id: 'sugg_5', label: 'Hỗ trợ chung', message: 'Xin chào, bạn có thể giúp gì cho tôi?' }
]

export const ChatSuggestion: React.FC<ChatSuggestionProps> = ({
  onSelect,
  disabled = false,
  suggestions = DEFAULT_SUGGESTIONS,
  title = 'Gợi ý câu hỏi'
}) => {
  const [items, setItems] = React.useState<ChatSuggestionItem[]>(suggestions)

  const shuffle = () => {
    const next = [...items]
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = next[i]
      next[i] = next[j]
      next[j] = tmp
    }
    setItems(next)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: 'grey.50'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
            {title}
          </Typography>
          <Tooltip title="Xáo trộn gợi ý">
            <span>
              <IconButton size="small" onClick={shuffle} disabled={disabled}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {items.map((s) => (
              <Tooltip key={s.id} title={s.message} placement="top">
                <span>
                  <Chip
                    label={s.label}
                    onClick={() => onSelect(s.message)}
                    disabled={disabled}
                    size="small"
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 1 },
                      bgcolor: 'background.paper'
                    }}
                  />
                </span>
              </Tooltip>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default ChatSuggestion
import React, { useEffect, useMemo, useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalHospital,
  CalendarToday,
  Psychology,
  Person,
  QuestionMark,
  MedicalServices
} from '@mui/icons-material'

export interface MiniOption {
  id: string
  label: string
  message: string
  icon: React.ReactElement
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  category: 'appointment' | 'symptom' | 'info' | 'general'
}

const MINI_OPTIONS: MiniOption[] = [
  // Appointment Options
  {
    id: 'check_appointment',
    label: 'Kiểm tra lịch hẹn',
    message: 'Tôi muốn kiểm tra lịch hẹn của mình',
    icon: <CalendarToday />,
    color: 'primary',
    category: 'appointment'
  },
  {
    id: 'book_appointment',
    label: 'Đặt lịch khám',
    message: 'Tôi muốn đặt lịch khám bệnh',
    icon: <LocalHospital />,
    color: 'primary',
    category: 'appointment'
  },
  {
    id: 'book_appointment_detailed',
    label: 'Đặt lịch (có triệu chứng)',
    message: 'Tôi muốn đặt lịch khám bệnh, có triệu chứng đau đầu và mệt mỏi',
    icon: <MedicalServices />,
    color: 'primary',
    category: 'appointment'
  },

  // Symptom Options
  {
    id: 'symptom_headache',
    label: 'Đau đầu',
    message: 'Tôi bị đau đầu và mệt mỏi nhiều ngày',
    icon: <Psychology />,
    color: 'primary',
    category: 'symptom'
  },
  {
    id: 'symptom_fever',
    label: 'Sốt',
    message: 'Tôi bị sốt và ho nhiều ngày',
    icon: <Psychology />,
    color: 'primary',
    category: 'symptom'
  },
  {
    id: 'symptom_chest_pain',
    label: 'Đau ngực',
    message: 'Tôi bị đau ngực và khó thở',
    icon: <Psychology />,
    color: 'primary',
    category: 'symptom'
  },

  // Info Options
  {
    id: 'patient_info',
    label: 'Thông tin cá nhân',
    message: 'Thông tin cá nhân và hồ sơ bệnh án của tôi như thế nào?',
    icon: <Person />,
    color: 'info',
    category: 'info'
  },
  {
    id: 'general_help',
    label: 'Trợ giúp',
    message: 'Xin chào, bạn có thể giúp gì cho tôi?',
    icon: <QuestionMark />,
    color: 'secondary',
    category: 'general'
  }
]

interface ChatMiniOptionsProps {
  onOptionSelect: (option: MiniOption) => void
  disabled?: boolean
  showCategories?: boolean
  maxVisible?: number
  options?: MiniOption[]
  title?: string
  enableSearch?: boolean
  layout?: 'list' | 'grid'
  columns?: number
}

export const ChatMiniOptions: React.FC<ChatMiniOptionsProps> = ({
  onOptionSelect,
  disabled = false,
  showCategories = true,
  maxVisible = 4,
  options,
  title = 'Gợi ý nhanh',
  enableSearch = true,
  layout = 'list',
  columns = 2
}) => {
  const [expanded, setExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [recent, setRecent] = useState<MiniOption[]>([])

  const STORAGE_KEY = 'chat_mini_options_recent'
  const allOptions = options && options.length > 0 ? options : MINI_OPTIONS

  const categories = {
    appointment: { label: 'Lịch hẹn', color: 'primary' as const },
    symptom: { label: 'Triệu chứng', color: 'warning' as const },
    info: { label: 'Thông tin', color: 'info' as const },
    general: { label: 'Chung', color: 'secondary' as const }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: MiniOption[] = JSON.parse(raw)
        setRecent(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  const filteredOptions = useMemo(() => {
    const byCategory = selectedCategory
      ? allOptions.filter(option => option.category === selectedCategory)
      : allOptions

    if (!search.trim()) return byCategory

    const q = search.toLowerCase()
    return byCategory.filter(
      opt =>
        opt.label.toLowerCase().includes(q) ||
        opt.message.toLowerCase().includes(q)
    )
  }, [allOptions, selectedCategory, search])

  const visibleOptions = expanded
    ? filteredOptions
    : filteredOptions.slice(0, maxVisible)
  const hasMoreOptions = filteredOptions.length > maxVisible

  const handleOptionClick = (option: MiniOption) => {
    if (!disabled) {
      onOptionSelect(option)
      setRecent(prev => {
        const next = [option, ...prev.filter(o => o.id !== option.id)].slice(
          0,
          5
        )
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
    }
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 0.5
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 'bold', color: 'text.secondary' }}
          >
            {title}
          </Typography>
          {hasMoreOptions && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {expanded ? 'Thu gọn' : 'Hiển thị thêm'}
              </Typography>
              <IconButton
                size="small"
                onClick={toggleExpanded}
                disabled={disabled}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
          )}
        </Stack>

        {/* Search */}
        {enableSearch && (
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm nhanh..."
            size="small"
            fullWidth
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <span role="img" aria-label="search">
                    🔎
                  </span>
                </InputAdornment>
              )
            }}
          />
        )}

        {/* Category Filters */}
        {showCategories && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="Tất cả"
              size="small"
              variant={selectedCategory === null ? 'filled' : 'outlined'}
              onClick={() => setSelectedCategory(null)}
              disabled={disabled}
            />
            {Object.entries(categories).map(([key, category]) => (
              <Chip
                key={key}
                label={category.label}
                size="small"
                color={category.color}
                variant={selectedCategory === key ? 'filled' : 'outlined'}
                onClick={() => setSelectedCategory(key)}
                disabled={disabled}
              />
            ))}
          </Stack>
        )}

        {/* Recent selections */}
        {recent.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {recent.map(option => (
                <Tooltip
                  key={`recent_${option.id}`}
                  title={option.message}
                  placement="top"
                >
                  <span>
                    <Chip
                      label={option.label}
                      color={option.color}
                      size="small"
                      icon={option.icon}
                      onClick={() => handleOptionClick(option)}
                      disabled={disabled}
                      variant="outlined"
                      sx={{ bgcolor: 'background.paper' }}
                    />
                  </span>
                </Tooltip>
              ))}
            </Stack>
          </Box>
        )}

        {/* Options */}
        {layout === 'grid' ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: 1
            }}
          >
            {visibleOptions.map(option => (
              <Tooltip key={option.id} title={option.message} placement="top">
                <span>
                  <Button
                    variant="outlined"
                    color={option.color}
                    size="small"
                    startIcon={option.icon}
                    onClick={() => handleOptionClick(option)}
                    disabled={disabled}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      height: 'auto',
                      py: 1,
                      px: 1.5,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      },
                      transition: 'all 0.2s'
                    }}
                    fullWidth
                  >
                    <Box sx={{ textAlign: 'left', width: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {option.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {option.message}
                      </Typography>
                    </Box>
                  </Button>
                </span>
              </Tooltip>
            ))}
          </Box>
        ) : (
          <Box>
            <Stack spacing={1}>
              {visibleOptions.map(option => (
                <Tooltip key={option.id} title={option.message} placement="top">
                  <Button
                    variant="outlined"
                    color={option.color}
                    size="small"
                    startIcon={option.icon}
                    onClick={() => handleOptionClick(option)}
                    disabled={disabled}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      height: 'auto',
                      py: 1,
                      px: 2,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box sx={{ textAlign: 'left', width: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {option.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '200px'
                        }}
                      >
                        {option.message}
                      </Typography>
                    </Box>
                  </Button>
                </Tooltip>
              ))}
            </Stack>
          </Box>
        )}

        {/* Show More/Less Indicator */}
        {hasMoreOptions && !expanded && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', fontStyle: 'italic' }}
          >
            +{filteredOptions.length - maxVisible} tùy chọn khác
          </Typography>
        )}
      </Stack>
    </Paper>
  )
}

// Compact version for smaller spaces
type ChatMiniOptionsCompactProps = Pick<
  ChatMiniOptionsProps,
  'onOptionSelect' | 'disabled'
>

export const ChatMiniOptionsCompact: React.FC<ChatMiniOptionsCompactProps> = ({
  onOptionSelect,
  disabled = false
}) => {
  const quickOptions = MINI_OPTIONS.slice(0, 6) // Show only 3 quick options

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{
        flexWrap: 'wrap',
        backgroundColor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 0.5,
        p: 1, 
        fontWeight: 'bold',
        color: 'text.secondary',
      }}
    >
      <Typography variant="subtitle2">Gợi ý nhanh :</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
        {quickOptions.map(option => (
          <Tooltip key={option.id} title={option.message} placement="top">
            <Chip
              label={option.label}
              color={option.color}
              size="small"
              icon={option.icon}
              onClick={() => onOptionSelect(option)}
              disabled={disabled}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)'
                },
                transition: 'transform 0.2s'
              }}
            />
          </Tooltip>
        ))}
      </Stack>
    </Stack>
  )
}

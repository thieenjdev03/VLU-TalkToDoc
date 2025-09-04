import { useState } from 'react'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography
} from '@mui/material'

import { createAppointment } from 'src/api/appointment'

import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

export interface AppointmentSuggestionData {
  type?: 'new_appointment' | 'follow_up' | 'emergency'
  doctorId: string
  doctorName: string
  doctorAvatar?: string
  doctorSpecialty: string
  suggestedDate: string
  suggestedTime: string
  reason: string
  estimatedDuration: number // minutes
  isFollowUp?: boolean
  lastAppointmentId?: string
  followUpReason?: string
  location?: string
  price?: number
  confirmationRequired?: boolean
  confirmationMessage?: string
}

interface Props {
  suggestion: AppointmentSuggestionData
  onAccept?: (appointmentId: string) => void
  onReject?: () => void
  disabled?: boolean
}

export default function ChatAppointmentSuggestion({
  suggestion,
  onAccept,
  onReject,
  disabled = false
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'accepted' | 'rejected'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    if (disabled || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      // Tạo lịch hẹn mới
      const appointmentData = {
        doctorId: suggestion.doctorId,
        date: suggestion.suggestedDate,
        time: suggestion.suggestedTime,
        reason: suggestion.reason,
        estimatedDuration: suggestion.estimatedDuration,
        location: suggestion.location,
        price: suggestion.price,
        status: 'PENDING'
      }

      const response = await createAppointment(appointmentData)
      
      setStatus('accepted')
      onAccept?.(response._id || response.appointmentId)
    } catch (err: any) {
      console.error('Error creating appointment:', err)
      setError(err?.response?.data?.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = () => {
    if (disabled || isProcessing) return
    setStatus('rejected')
    onReject?.()
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

  const formatTime = (timeString: string) => timeString

  if (status === 'accepted') {
    return (
      <Card
        sx={{
          p: 2,
          border: '2px solid',
          borderColor: 'success.main',
          backgroundColor: 'success.lighter',
          maxWidth: 400
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'success.main'
            }}
          >
            <Iconify icon="eva:checkmark-fill" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="success.darker">
              Đã chấp nhận lịch hẹn
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lịch hẹn đã được tạo thành công
            </Typography>
          </Box>
        </Stack>
      </Card>
    )
  }

  if (status === 'rejected') {
    return (
      <Card
        sx={{
          p: 2,
          border: '2px solid',
          borderColor: 'error.main',
          backgroundColor: 'error.lighter',
          maxWidth: 400
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'error.main'
            }}
          >
            <Iconify icon="eva:close-fill" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="error.darker">
              Đã từ chối lịch hẹn
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn có thể yêu cầu lịch hẹn khác
            </Typography>
          </Box>
        </Stack>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'primary.light',
        backgroundColor: 'primary.lighter',
        maxWidth: 400,
        position: 'relative'
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: 'primary.main'
          }}
        >
          <Iconify icon="eva:calendar-fill" />
        </Avatar>
        <Box>
          <Typography variant="subtitle2" color="primary.darker">
            {suggestion.isFollowUp ? 'Gợi ý tái khám' : 'Gợi ý lịch hẹn'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {suggestion.isFollowUp 
              ? 'Dựa trên lịch sử khám bệnh của bạn'
              : 'Dựa trên tình trạng sức khỏe của bạn'
            }
          </Typography>
        </Box>
      </Stack>

      {/* Doctor Info */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Avatar
          src={suggestion.doctorAvatar}
          alt={suggestion.doctorName}
          sx={{ width: 48, height: 48 }}
        />
        <Box flex={1}>
          <Typography variant="subtitle2" color="text.primary">
            {suggestion.doctorName}
          </Typography>
          <Chip
            label={suggestion.doctorSpecialty}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {/* Appointment Details */}
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:calendar-outline" width={16} />
          <Typography variant="body2" color="text.primary">
            {formatDate(suggestion.suggestedDate)}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:clock-outline" width={16} />
          <Typography variant="body2" color="text.primary">
            {formatTime(suggestion.suggestedTime)}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:time-outline" width={16} />
          <Typography variant="body2" color="text.primary">
            Khoảng {suggestion.estimatedDuration} phút
          </Typography>
        </Stack>

        {suggestion.location && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:pin-outline" width={16} />
            <Typography variant="body2" color="text.primary">
              {suggestion.location}
            </Typography>
          </Stack>
        )}

        {suggestion.price && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:credit-card-outline" width={16} />
            <Typography variant="body2" color="text.primary">
              {suggestion.price.toLocaleString('vi-VN')} VNĐ
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Reason */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {suggestion.isFollowUp ? 'Lý do tái khám:' : 'Lý do khám:'}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {suggestion.reason}
        </Typography>
        {suggestion.followUpReason && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', mt: 1 }}>
              Chi tiết tái khám:
            </Typography>
            <Typography variant="body2" color="text.primary">
              {suggestion.followUpReason}
            </Typography>
          </>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleAccept}
          disabled={disabled || isProcessing}
          startIcon={
            isProcessing ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="eva:checkmark-fill" />
            )
          }
          sx={{ flex: 1 }}
        >
          {isProcessing ? 'Đang xử lý...' : (suggestion.isFollowUp ? 'Đặt tái khám' : 'Chấp nhận')}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={handleReject}
          disabled={disabled || isProcessing}
          startIcon={<Iconify icon="eva:close-fill" />}
          sx={{ flex: 1 }}
        >
          {suggestion.isFollowUp ? 'Không tái khám' : 'Từ chối'}
        </Button>
      </Stack>
    </Card>
  )
}

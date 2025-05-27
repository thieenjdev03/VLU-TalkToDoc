import { useEffect } from 'react'
import { Icon } from '@iconify/react'

import { styled } from '@mui/material/styles'
import { Box, Stack, Paper, Button, Avatar, Typography } from '@mui/material'

interface IncomingCallProps {
  incomingCall: any
  currentAppointment?: any
  callerInfo?: {
    name: string
    role: string
    avatarUrl?: string
    specialtyName?: string
  }
  onAnswer: () => void
  onReject: () => void
}

// Styled component cho container
const CallContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  padding: theme.spacing(3),
  borderRadius: 16,
  backgroundColor: '#f9fafb',
  color: '#1a237e',
  textAlign: 'center',
  boxShadow: '0px 8px 24px rgba(33, 150, 243, 0.15)',
  border: '1.5px solid #90caf9',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1300
}))

export default function IncomingCall({
  incomingCall,
  currentAppointment,
  callerInfo,
  onAnswer,
  onReject
}: IncomingCallProps) {
  // Ghi log để debug
  useEffect(() => {
    if (incomingCall) {
      console.log('IncomingCall component - cuộc gọi đến:', incomingCall.callId)

      // Log thông tin caller
      if (callerInfo) {
        console.log('IncomingCall component - thông tin người gọi:', callerInfo)
      }

      // Log thông tin appointment nếu có
      if (currentAppointment) {
        console.log(
          'IncomingCall component - thông tin cuộc hẹn:',
          currentAppointment
        )
      }
    }
  }, [incomingCall, callerInfo, currentAppointment])

  // Early return nếu không có cuộc gọi đến
  if (!incomingCall) return null

  // Xác định vai trò người gọi
  const roleLabel = callerInfo?.role === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'

  // Xác định tên hiển thị
  const displayName =
    callerInfo?.name ||
    (roleLabel === 'Bác sĩ'
      ? currentAppointment?.doctor?.fullName
      : currentAppointment?.patient?.fullName) ||
    'Người gọi'

  // Xác định avatar
  const avatarUrl =
    callerInfo?.avatarUrl ||
    (roleLabel === 'Bác sĩ'
      ? currentAppointment?.doctor?.avatarUrl
      : currentAppointment?.patient?.avatarUrl)

  // Xử lý sự kiện trả lời an toàn
  const handleAnswer = () => {
    console.log('IncomingCall component - Trả lời cuộc gọi')
    onAnswer()
  }

  // Xử lý sự kiện từ chối an toàn
  const handleReject = () => {
    console.log('IncomingCall component - Từ chối cuộc gọi')
    onReject()
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CallContainer>
        <Stack alignItems="center" spacing={2}>
          {/* Avatar */}
          <Avatar
            src={avatarUrl}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid #43a047',
              backgroundColor: theme => theme.palette.primary.main,
              fontSize: 32,
              fontWeight: 'bold'
            }}
          >
            {!avatarUrl && displayName?.charAt(0)}
          </Avatar>

          {/* Caller Name */}
          <Typography variant="h6" sx={{ color: '#1565c0', fontWeight: 600 }}>
            {displayName}
          </Typography>

          {/* Specialty if doctor */}
          {callerInfo?.specialtyName && (
            <Typography
              variant="body2"
              sx={{ color: '#388e3c', fontWeight: 500 }}
            >
              Chuyên khoa: {callerInfo.specialtyName}
            </Typography>
          )}

          {/* Appointment Info */}
          {currentAppointment && (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Ngày {currentAppointment?.date}
              <br />
              Lúc {currentAppointment?.slot}
            </Typography>
          )}

          {/* Call Status */}
          <Typography variant="body2" sx={{ color: '#546e7a' }}>
            {roleLabel} đang gọi cho bạn...
          </Typography>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 2, width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleReject}
              sx={{
                backgroundColor: '#e53935',
                color: '#fff',
                '&:hover': { backgroundColor: '#b71c1c' }
              }}
              startIcon={<Icon icon="mdi:phone-hangup" />}
            >
              Từ chối
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAnswer}
              sx={{
                backgroundColor: '#43a047',
                color: '#fff',
                '&:hover': { backgroundColor: '#2e7d32' }
              }}
              startIcon={<Icon icon="mdi:phone" />}
            >
              Chấp nhận
            </Button>
          </Stack>
        </Stack>
      </CallContainer>
    </Box>
  )
}

import { useState } from 'react'

import { Box, Button, Card, Stack, Typography } from '@mui/material'

import ChatAppointmentSuggestion, { AppointmentSuggestionData } from './chat-appointment-suggestion'

// ----------------------------------------------------------------------

const mockSuggestion: AppointmentSuggestionData = {
  doctorId: 'doctor_123',
  doctorName: 'BS. Nguyễn Văn An',
  doctorAvatar: 'https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/doctor_avatar.jpg',
  doctorSpecialty: 'Tim mạch',
  suggestedDate: '2024-01-20',
  suggestedTime: '14:30',
  reason: 'Khám định kỳ và theo dõi huyết áp sau khi có triệu chứng đau ngực',
  estimatedDuration: 30,
  location: 'Phòng khám Tim mạch - Tầng 3',
  price: 500000
}

export default function ChatAppointmentDemo() {
  const [acceptedAppointments, setAcceptedAppointments] = useState<string[]>([])
  const [rejectedCount, setRejectedCount] = useState(0)

  const handleAccept = (appointmentId: string) => {
    setAcceptedAppointments(prev => [...prev, appointmentId])
    console.log('Demo: Appointment accepted:', appointmentId)
  }

  const handleReject = () => {
    setRejectedCount(prev => prev + 1)
    console.log('Demo: Appointment rejected')
  }

  const resetDemo = () => {
    setAcceptedAppointments([])
    setRejectedCount(0)
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Demo: Gợi ý lịch hẹn trong Chat
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Thống kê Demo
        </Typography>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2">
            Đã chấp nhận: {acceptedAppointments.length} lịch hẹn
          </Typography>
          <Typography variant="body2">
            Đã từ chối: {rejectedCount} lịch hẹn
          </Typography>
        </Stack>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={resetDemo}
          sx={{ mt: 1 }}
        >
          Reset Demo
        </Button>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Tin nhắn từ AI với gợi ý lịch hẹn
        </Typography>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: '#e5f0fc',
            color: '#000',
            wordBreak: 'break-word',
            fontSize: 14,
            fontWeight: 400,
            boxShadow: 1,
            mb: 2
          }}
        >
          Dựa trên các triệu chứng bạn mô tả, tôi khuyên bạn nên đặt lịch hẹn với bác sĩ chuyên khoa Tim mạch để được khám và tư vấn chi tiết. Dưới đây là gợi ý lịch hẹn phù hợp:
        </Box>
        
        <ChatAppointmentSuggestion
          suggestion={mockSuggestion}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Các trạng thái khác nhau
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Trạng thái bình thường (có thể tương tác):
            </Typography>
            <ChatAppointmentSuggestion
              suggestion={{
                ...mockSuggestion,
                doctorName: 'BS. Trần Thị Bình',
                suggestedDate: '2024-01-21',
                suggestedTime: '09:00'
              }}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Trạng thái disabled (không thể tương tác):
            </Typography>
            <ChatAppointmentSuggestion
              suggestion={{
                ...mockSuggestion,
                doctorName: 'BS. Lê Văn Cường',
                suggestedDate: '2024-01-22',
                suggestedTime: '16:00'
              }}
              onAccept={handleAccept}
              onReject={handleReject}
              disabled
            />
          </Box>
        </Stack>
      </Card>
    </Box>
  )
}

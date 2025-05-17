// components/IncomingCallPopup.tsx

import React from 'react'
import { Icon } from '@iconify/react'
import Draggable from 'react-draggable'

import { styled } from '@mui/material/styles'
import { Box, Stack, Paper, Button, Avatar, Typography } from '@mui/material'

interface IncomingCallPopupProps {
  isOpen: boolean
  fullName: string
  avatarUrl?: string
  role: 'doctor' | 'patient'
  specialtyName?: string
  onAccept: () => void
  onReject: () => void
}

// Sử dụng màu xanh dương và xanh lá y tế, nền sáng hơn, chữ tối hơn
const PopupContainer = styled(Paper)(({ theme }) => ({
  width: 320,
  padding: theme.spacing(3),
  borderRadius: 16,
  backgroundColor: '#f9fafb',
  color: '#1a237e',
  textAlign: 'center',
  boxShadow: '0px 8px 24px rgba(33, 150, 243, 0.15)',
  border: '1.5px solid #90caf9',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 1300,
  cursor: 'grab'
}))

export default function IncomingCallPopup({
  isOpen,
  fullName,
  avatarUrl,
  role,
  specialtyName,
  onAccept,
  onReject
}: IncomingCallPopupProps) {
  const roleLabel = role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'

  // Đặt vị trí mặc định ở giữa màn hình
  const defaultPosition = {
    x: window.innerWidth / 2 - 160,
    y: window.innerHeight * 0.2
  }

  return (
    <Draggable
      defaultPosition={defaultPosition}
      bounds={{
        left: 0,
        top: 0,
        right: window.innerWidth - 320,
        bottom: window.innerHeight - 200
      }}
      handle=".incoming-call-popup-drag-handle"
    >
      <PopupContainer
        sx={{
          boxShadow: 3,
          userSelect: 'none'
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Box
            className="incoming-call-popup-drag-handle"
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              cursor: 'grab',
              userSelect: 'none'
            }}
          >
            <Icon
              icon="mdi:drag-vertical"
              width={24}
              height={24}
              color="black"
              style={{ marginRight: 8, opacity: 0.7 }}
            />
            <Typography
              variant="caption"
              sx={{ color: 'black', fontWeight: 500 }}
            >
              Kéo để di chuyển
            </Typography>
          </Box>
          <Avatar
            src={avatarUrl}
            sx={{
              width: 72,
              height: 72,
              border: '3px solid #43a047',
              backgroundColor: '#fff'
            }}
          />
          <Typography variant="h6" sx={{ color: '#1565c0', fontWeight: 600 }}>
            {roleLabel}: {fullName}
          </Typography>
          {specialtyName && (
            <Typography
              variant="body2"
              sx={{ color: '#388e3c', fontWeight: 500 }}
            >
              Chuyên khoa: {specialtyName}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: '#546e7a' }}>
            đang gọi cho bạn...
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              onClick={onReject}
              variant="contained"
              sx={{
                flex: 1,
                backgroundColor: '#e53935',
                color: '#fff',
                '&:hover': { backgroundColor: '#b71c1c' }
              }}
              startIcon={<Icon icon="mdi:phone-hangup" />}
            >
              Từ chối
            </Button>
            <Button
              onClick={onAccept}
              variant="contained"
              sx={{
                flex: 1,
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
      </PopupContainer>
    </Draggable>
  )
}

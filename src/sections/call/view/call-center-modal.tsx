'use client'

import { Icon } from '@iconify/react'
import React, { useState } from 'react'

import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import MinimizeIcon from '@mui/icons-material/Minimize'
import {
  Box,
  Stack,
  Dialog,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent
} from '@mui/material'

import CallCenter from 'src/sections/call/view/call-center'

interface CallCenterModalProps {
  open: boolean
  onClose: () => void
  stringeeAccessToken: string
  fromUserId: string
  userInfor: any
  currentAppointment: any
  callStatus: string
}

const MinimizedDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    position: 'fixed',
    bottom: 20,
    right: 20,
    margin: 0,
    width: 300,
    height: 150,
    transition: 'all 0.3s ease-in-out',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#212121',
    color: '#fff',
    padding: theme.spacing(2)
  }
}))

export default function CallCenterModal({
  open,
  onClose,
  stringeeAccessToken,
  fromUserId,
  userInfor,
  currentAppointment,
  callStatus
}: CallCenterModalProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const userProfile = localStorage.getItem('userProfile')
  const userProfileData = JSON.parse(userProfile || '{}')

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }

  if (!open) return null

  if (isMinimized) {
    const initialPatientName = userInfor?.fullName
      ? userInfor.fullName
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .toUpperCase()
      : 'KH'

    const initialDoctorName = currentAppointment?.doctor?.fullName
      ? currentAppointment?.doctor?.fullName
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .toUpperCase()
      : 'BS'
    return (
      <MinimizedDialog open={open} onClose={onClose}>
        <Stack
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          height="100%"
        >
          <Typography variant="body2" color="gray">
            Đang gọi...
          </Typography>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#3949ab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 'bold'
            }}
          >
            {userProfileData?.role === 'PATIENT' && !callStatus
              ? initialDoctorName
              : initialPatientName}
          </Box>
          <Box
            className="cta-button-group-minimized"
            display="flex"
            justifyContent="space-between"
            width="100%"
          >
            <IconButton size="small" sx={{ color: '#fff' }}>
              <Icon icon="mdi:microphone" />
            </IconButton>
            <IconButton size="small" sx={{ color: '#fff' }}>
              <Icon icon="mdi:video" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: '#f44336' }}
              onClick={onClose}
            >
              <Icon icon="mdi:phone-hangup" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: '#fff' }}
              onClick={handleMaximize}
            >
              <Icon icon="mdi:arrow-expand" />
            </IconButton>
          </Box>
        </Stack>
      </MinimizedDialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="2xl">
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <IconButton
            aria-label="minimize"
            onClick={handleMinimize}
            sx={{
              position: 'absolute',
              right: 48,
              top: 8
            }}
          >
            <MinimizeIcon />
          </IconButton>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#f9fafb' }} dividers>
        <CallCenter
          currentAppointment={currentAppointment}
          stringeeAccessToken={stringeeAccessToken}
          fromUserId={fromUserId}
          userInfor={userInfor}
        />
      </DialogContent>
    </Dialog>
  )
}

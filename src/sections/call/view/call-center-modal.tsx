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
  useTheme,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  useMediaQuery
} from '@mui/material'

import { useCallStore } from 'src/store/call-store'

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
    bottom: theme.spacing(2.5),
    right: theme.spacing(2.5),
    margin: 0,
    width: 300,
    height: 150,
    transition: 'all 0.3s ease-in-out',
    borderRadius: theme.shape.borderRadius * 1.5,
    overflow: 'hidden',
    backgroundColor: '#212121',
    color: '#fff',
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: '90%',
      right: '5%',
      bottom: theme.spacing(2)
    }
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const { activeCall } = useCallStore()

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
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: '50%',
              backgroundColor: '#3949ab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: { xs: 14, sm: 16 },
              fontWeight: 'bold'
            }}
          >
            <span>
              {userProfileData?.role === 'PATIENT' && !callStatus
                ? initialDoctorName
                : initialPatientName}
            </span>
          </Box>
          <Box
            className="cta-button-group-minimized"
            display="flex"
            justifyContent="space-between"
            width="100%"
            sx={{ gap: { xs: 1, sm: 2 } }}
          >
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              sx={{ color: '#fff' }}
            >
              <Icon icon="mdi:microphone" width={isMobile ? 20 : 24} />
            </IconButton>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              sx={{ color: '#fff' }}
            >
              <Icon icon="mdi:video" width={isMobile ? 20 : 24} />
            </IconButton>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              sx={{ color: '#f44336' }}
              onClick={onClose}
            >
              <Icon icon="mdi:phone-hangup" width={isMobile ? 20 : 24} />
            </IconButton>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              sx={{ color: '#fff' }}
              onClick={handleMaximize}
            >
              <Icon icon="mdi:arrow-expand" width={isMobile ? 20 : 24} />
            </IconButton>
          </Box>
        </Stack>
      </MinimizedDialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isMobile ? 'sm' : 'xl'}
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: 1, sm: 2 }
        }}
      >
        <Box
          sx={{
            m: 0,
            p: { xs: 1, sm: 2 },
            height: 8,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            color: '#f9fafb'
          }}
        >
          <IconButton
            aria-label="minimize"
            onClick={() => setIsMinimized(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            <MinimizeIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size={isMobile ? 'small' : 'medium'}
          >
            <CloseIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: '#f9fafb',
          p: { xs: 1, sm: 2, md: 3 },
          height: isMobile ? '100vh' : 'auto'
        }}
        dividers
      >
        <CallCenter
          currentAppointment={currentAppointment}
          stringeeAccessToken={stringeeAccessToken}
          userInfor={userInfor}
          isMinimized={false}
          onMinimize={setIsMinimized}
          activeCall={activeCall}
        />
      </DialogContent>
    </Dialog>
  )
}

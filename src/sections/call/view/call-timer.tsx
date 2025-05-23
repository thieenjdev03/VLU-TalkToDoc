import { useState, useEffect } from 'react'

import { Box, Typography } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff'

interface CallTimerProps {
  isRunning: boolean // true khi đang gọi
  onEnd?: (duration: number) => void // callback khi gọi xong (trả về số giây)
  isConnected: boolean // true khi đã kết nối
}

export default function CallTimer({
  isRunning,
  onEnd,
  isConnected
}: CallTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isRunning) {
      if (onEnd && seconds > 0) onEnd(seconds)
      return
    }

    const id = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  useEffect(() => {
    if (!isRunning) setSeconds(0)
  }, [isRunning])

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box
        component="span"
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          backgroundColor: '#e0e7ef',
          color: '#1976d2',
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-block'
        }}
      >
        {isConnected ? (
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTimeIcon fontSize="small" />
            <Typography variant="body2" fontWeight={500}>
              {formatTime(seconds)}
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="body2"
            fontWeight={500}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <DataSaverOffIcon
              fontSize="small"
              sx={{ animation: 'spin 1s linear infinite' }}
            />
            Đang kết nối...
          </Typography>
        )}
      </Box>
    </Box>
  )
}

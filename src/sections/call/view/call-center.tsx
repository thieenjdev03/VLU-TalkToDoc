import { Icon } from '@iconify/react'
import { useRef, useState, useEffect } from 'react'

import RestoreIcon from '@mui/icons-material/Fullscreen'
import { Box, Stack, Button, Typography, IconButton } from '@mui/material'

import CallTimer from './call-timer'
import CallChatBox from './call-chat-box'

interface CallComponentProps {
  stringeeAccessToken: string
  fromUserId: string
  userInfor: any
  currentAppointment: any
  isMinimized: boolean
  onMinimize: (isMinimized: boolean) => void
}

export default function CallCenter({
  stringeeAccessToken,
  fromUserId,
  userInfor,
  currentAppointment,
  isMinimized,
  onMinimize
}: CallComponentProps) {
  const stringeeClientRef = useRef<any>(null)
  const activeCallRef = useRef<any>(null)

  const [clientConnected, setClientConnected] = useState(false)
  const [calling, setCalling] = useState(false)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [callStatus, setCallStatus] = useState('Chưa bắt đầu')
  const [isVideoCall, setIsVideoCall] = useState(false)
  useEffect(() => {
    if (!stringeeAccessToken) return

    if (typeof window !== 'undefined' && (window as any).StringeeClient) {
      const client = new (window as any).StringeeClient()
      stringeeClientRef.current = client

      client.connect(stringeeAccessToken)

      client.on('connect', () => setClientConnected(true))
      client.on('authenerror', () => {
        setClientConnected(false)
        setCallStatus('Lỗi xác thực')
      })
      client.on('disconnect', () => {
        setClientConnected(false)
        setCallStatus('Mất kết nối')
      })
      client.on('incomingcall', (incomingCallObj: any) => {
        setIncomingCall(incomingCallObj)
        settingCallEvent(incomingCallObj)
        // setCallStatus('Có cuộc gọi đến');
      })
    }
  }, [stringeeAccessToken])
  console.log('userInfor', userInfor)
  const makeCall = (video = true) => {
    if (!clientConnected || !currentAppointment?.doctor?.id) {
      setCallStatus('Chưa kết nối hoặc thiếu ID người nhận')
      return
    }
    setIsVideoCall(video)
    const callFromId = userInfor?._id
    const callToId =
      userInfor?._id === currentAppointment?.doctor?._id
        ? currentAppointment?.patient?._id
        : currentAppointment?.doctor?._id

    const call = new (window as any).StringeeCall(
      stringeeClientRef.current,
      callFromId,
      callToId,
      video
    )
    settingCallEvent(call)
    // registerCallEvents(call)

    call.makeCall((res: any) => {
      if (res.r === 0) {
        activeCallRef.current = call
        setCalling(true)
        setCallStatus('Đang gọi...')
      } else {
        setCallStatus(`Gọi thất bại: ${res.message}`)
      }
    })
  }

  const endCall = () => {
    if (activeCallRef.current) {
      activeCallRef.current.hangup()
      activeCallRef.current = null
      setCalling(false)
      setCallStatus('Đã kết thúc cuộc gọi')
    }
  }

  const answerIncomingCall = () => {
    if (!incomingCall) return
    setIsVideoCall(true)
    activeCallRef.current = incomingCall
    settingCallEvent(incomingCall)
    incomingCall.answer()
    setIncomingCall(null)
    setCalling(true)
    setCallStatus('Đã trả lời cuộc gọi')
  }

  const rejectIncomingCall = () => {
    if (incomingCall) {
      incomingCall.reject()
      setIncomingCall(null)
      setCallStatus('Đã từ chối cuộc gọi')
    }
  }

  const mute = () => {
    if (activeCallRef.current) {
      activeCallRef.current.mute(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const enableVideo = () => {
    if (activeCallRef.current) {
      activeCallRef.current.enableVideo(!isVideoEnabled)
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

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

  if (isMinimized) {
    // UI thu nhỏ đồng bộ style với Dialog
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 320,
          height: 100,
          bgcolor: '#212121',
          color: '#fff',
          borderRadius: 3,
          boxShadow: 8,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: '#3949ab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              mr: 1
            }}
          >
            {userInfor?.role === 'PATIENT'
              ? initialDoctorName
              : initialPatientName}
          </Box>
          <Box>
            <Typography variant="body2" color="gray">
              Đang gọi...
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {userInfor?.role === 'PATIENT'
                ? currentAppointment?.doctor?.fullName || 'Bác sĩ'
                : currentAppointment?.patient?.fullName || 'Bệnh nhân'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          sx={{ color: '#fff', ml: 2 }}
          onClick={() => onMinimize(false)}
        >
          <RestoreIcon />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box
        borderRadius={2}
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={{ xs: 2, sm: 3 }}
        bgcolor="white"
        boxShadow={3}
      >
        {/* Logo */}
        <Box
          sx={{
            width: { xs: '100%', sm: 120 },
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <img
            src="https://res.cloudinary.com/dut4zlbui/image/upload/v1746366836/geiw8b1qgv3w7sia9o4h.png"
            alt="Logo"
            style={{ maxHeight: '50px', objectFit: 'contain' }}
          />
        </Box>

        {/* Divider */}
        <Typography
          variant="h6"
          color="text.disabled"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          |
        </Typography>

        {/* Appointment Info */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 4 }}
          width="100%"
          bgcolor="white"
          p={1}
          borderRadius={2}
        >
          <Stack spacing={0.5} width={{ xs: '100%', sm: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              Bác sĩ:{' '}
              <Typography
                component="span"
                fontWeight="500"
                color="text.primary"
              >
                {currentAppointment?.doctor?.fullName || '---'}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bệnh nhân:{' '}
              <Typography
                component="span"
                fontWeight="500"
                color="text.primary"
              >
                {currentAppointment?.patient?.fullName || '---'}
              </Typography>
            </Typography>
          </Stack>

          <Stack spacing={0.5} width={{ xs: '100%', sm: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              Ngày:{' '}
              <Typography
                component="span"
                fontWeight="500"
                color="text.primary"
              >
                {currentAppointment?.date || '---'}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Giờ:{' '}
              <Typography
                component="span"
                fontWeight="500"
                color="text.primary"
              >
                {currentAppointment?.slot || '---'}
              </Typography>
            </Typography>
          </Stack>
        </Stack>
      </Box>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        gap={2}
        alignItems="center"
      >
        {incomingCall && (
          <Box
            sx={{
              mt: 2,
              px: 3,
              py: 2,
              borderRadius: 4,
              bgcolor: '#333',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '50%',
              boxShadow: 4
            }}
          >
            <Box>
              <Typography variant="body2" color="gray">
                Cuộc gọi đến
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {incomingCall.from || 'Người gọi'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <IconButton
                onClick={answerIncomingCall}
                sx={{
                  bgcolor: 'green',
                  '&:hover': { bgcolor: 'darkgreen' },
                  color: 'white',
                  width: 48,
                  height: 48
                }}
              >
                <Icon icon="mdi:phone" width={24} height={24} />
              </IconButton>

              <IconButton
                onClick={rejectIncomingCall}
                sx={{
                  bgcolor: 'red',
                  '&:hover': { bgcolor: 'darkred' },
                  color: 'white',
                  width: 48,
                  height: 48
                }}
              >
                <Icon icon="mdi:phone-hangup" width={24} height={24} />
              </IconButton>

              <IconButton
                sx={{
                  bgcolor: 'gray',
                  '&:hover': { bgcolor: 'darkgray' },
                  color: 'white',
                  width: 48,
                  height: 48
                }}
              >
                <Icon icon="mdi:email-outline" width={24} height={24} />
              </IconButton>
            </Stack>
          </Box>
        )}
      </Box>
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box display="flex" flexDirection="row" gap={2} width="100%">
          <Box display="flex" flexDirection="column" gap={2} width="100%">
            <Box
              width="100%"
              borderRadius={2}
              overflow="hidden"
              boxShadow={3}
              position="relative"
              sx={{
                height: { xs: '60vh', sm: '60vh' }
              }}
              bgcolor={`${isVideoCall ? 'black' : '#242A2F'}`}
            >
              {/* Remote Video */}
              <Box
                width="100%"
                height="100%"
                sx={{ position: 'relative', zIndex: 1 }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 2,
                    zIndex: 2
                  }}
                >
                  <CallTimer
                    isRunning={calling}
                    isConnected={clientConnected}
                    onEnd={duration =>
                      console.log('Call ended in', duration, 's')
                    }
                  />
                </Box>
                <video
                  id="remoteVideo"
                  playsInline
                  autoPlay
                  muted={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#'
                  }}
                >
                  <track kind="captions" src="" label="English" />
                </video>
                {isVideoCall ||
                  (clientConnected && (
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: 'white',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#424141'
                      }}
                    >
                      {userInfor?.role === 'DOCTOR' ? 'BN' : 'BS'}
                    </Box>
                  ))}
              </Box>

              {/* Local Video - Small preview at bottom right */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  width: '180px',
                  height: '120px',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3,
                  zIndex: 2,
                  backgroundColor: '#424141'
                }}
              >
                <Box
                  sx={{
                    borderRadius: '50%',
                    backgroundColor: '#424141',
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <video
                    id="localVideo"
                    playsInline
                    autoPlay
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 1
                    }}
                  />
                  {(callStatus || !isVideoCall) && (
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        backgroundColor: '#424141',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      {userInfor?.role === 'DOCTOR' ? 'BS' : 'BN'}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
            {callStatus && (
              <span
                style={{
                  fontSize: 16,
                  width: '100%',
                  fontWeight: 'bold',
                  padding: 2,
                  borderRadius: 2,
                  backgroundColor: '#dfdfdf',
                  color: 'black',
                  textAlign: 'center'
                }}
              >
                {callStatus}
              </span>
            )}
            <Stack
              direction="row"
              spacing={2}
              p={1}
              justifyContent="center"
              flexWrap="wrap"
              borderRadius={2}
              boxShadow={2}
              gap={{ xs: 1, sm: 2 }}
              bgcolor="white"
              width="100%"
              sx={{
                '& > button': {
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  boxShadow: 1,
                  minWidth: 0,
                  padding: 0,
                  '&:hover': {
                    transform: 'scale(1.08)',
                    opacity: 0.9
                  }
                }
              }}
            >
              {/* Mic Button */}
              <Button
                variant="contained"
                onClick={mute}
                sx={{
                  backgroundColor: isMuted ? 'warning.main' : 'primary.main',
                  '&:hover': {
                    backgroundColor: isMuted ? 'warning.dark' : 'primary.dark'
                  }
                }}
              >
                <Icon
                  icon={isMuted ? 'mdi:microphone-off' : 'mdi:microphone'}
                  width={18}
                  height={18}
                />
              </Button>

              {/* Camera Button */}
              <Button
                variant="contained"
                onClick={enableVideo}
                sx={{
                  backgroundColor: isVideoEnabled
                    ? 'primary.main'
                    : 'warning.main',
                  '&:hover': {
                    backgroundColor: isVideoEnabled
                      ? 'primary.dark'
                      : 'warning.dark'
                  }
                }}
              >
                <Icon
                  icon={isVideoEnabled ? 'mdi:video' : 'mdi:video-off'}
                  width={18}
                  height={18}
                />
              </Button>

              {/* Record Button */}
              <Button
                variant="contained"
                sx={{
                  backgroundColor: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.dark'
                  }
                }}
              >
                <Icon icon="mdi:record-circle" width={18} height={18} />
              </Button>
              {/* Make Call */}
              <Button
                variant="contained"
                onClick={() => makeCall(true)}
                disabled={calling}
                sx={{
                  backgroundColor: 'success.main',
                  '&:hover': {
                    backgroundColor: 'success.dark'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'grey.300',
                    color: 'grey.500'
                  }
                }}
              >
                <Icon icon="mdi:phone" width={18} height={18} />
              </Button>

              {/* End Call */}
              <Button
                variant="contained"
                onClick={endCall}
                disabled={!calling}
                sx={{
                  backgroundColor: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.dark'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'grey.300',
                    color: 'grey.500'
                  }
                }}
              >
                <Icon icon="mdi:phone-hangup" width={18} height={18} />
              </Button>
            </Stack>
          </Box>
          <CallChatBox
            currentUser={userInfor?._id || 'Bạn'}
            peerUser={
              userInfor?.role === 'DOCTOR'
                ? currentAppointment?.patient?._id
                : currentAppointment?.doctor?._id
            }
            userInfor={userInfor}
            appointmentId={currentAppointment?.id}
          />
        </Box>
      </Box>
    </Box>
  )
}
function settingCallEvent(call: any) {
  // Lấy element video từ DOM
  const remoteVideo = document.getElementById(
    'remoteVideo'
  ) as HTMLVideoElement | null
  const localVideo = document.getElementById(
    'localVideo'
  ) as HTMLVideoElement | null

  // Sự kiện khi có stream remote
  call.on('addremotestream', (stream: MediaStream) => {
    console.log('addremotestream')
    if (!remoteVideo) return
    remoteVideo.srcObject = null
    remoteVideo.srcObject = stream
  })

  // Sự kiện khi có stream local
  call.on('addlocalstream', (stream: MediaStream) => {
    console.log('addlocalstream')
    if (!localVideo) return
    localVideo.srcObject = null
    localVideo.srcObject = stream
  })

  // Sự kiện lỗi
  call.on('error', (info: any) => {
    console.log(`on error: ${JSON.stringify(info)}`)
  })

  // Sự kiện trạng thái tín hiệu
  call.on('signalingstate', (state: any) => {
    console.log('signalingstate ', state)
    if (state.reason && typeof state.reason === 'string') {
      // Nếu có element callStatus thì cập nhật nội dung
      const callStatusEl = document.getElementById('callStatus')
      if (callStatusEl) callStatusEl.innerHTML = state.reason
    }

    if (state.code === 6) {
      // call Ended
      const incomingCallDiv = document.getElementById('incoming-call-div')
      if (incomingCallDiv) incomingCallDiv.style.display = 'none'
    } else if (state.code === 5) {
      // busy
    }
  })

  // Sự kiện trạng thái media
  call.on('mediastate', (state: any) => {
    console.log('mediastate ', state)
  })
  call.on('info', (info: any) => {
    console.log(`on info:${JSON.stringify(info)}`)
  })

  call.on('otherdevice', (data: any) => {
    console.log(`on otherdevice:${JSON.stringify(data)}`)
    if (
      (data.type === 'CALL_STATE' && data.code >= 200) ||
      data.type === 'CALL_END'
    ) {
      const incomingCallDiv = document.getElementById('incoming-call-div')
      if (incomingCallDiv) incomingCallDiv.style.display = 'none'
      // Có thể gọi hàm xử lý kết thúc cuộc gọi ở đây nếu cần
    }
  })
}

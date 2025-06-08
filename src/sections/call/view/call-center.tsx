import { Icon } from '@iconify/react'
import { useRef, useState, useEffect, useCallback } from 'react'

import RestoreIcon from '@mui/icons-material/Fullscreen'
import {
  Box,
  Stack,
  Button,
  useTheme,
  Typography,
  IconButton,
  useMediaQuery
} from '@mui/material'

import { useCallListener } from 'src/hooks/use-call-listener'

import { useCallStore } from 'src/store/call-store'

import CallTimer from './call-timer'
import CallChatBox from './call-chat-box'
import IncomingCall from './incoming-call'

// Cập nhật interface để phù hợp với kiểu trả về của hook
interface UseCallListenerResult {
  stringeeClient: any
  setupCallEvents: (call: any) => void
  cleanupCallEvents: (call: any) => void
  isCallRegistered?: (callId: string) => boolean
}

interface CallComponentProps {
  stringeeAccessToken: string
  userInfor: any
  currentAppointment: any
  isMinimized: boolean
  onMinimize: (isMinimized: boolean) => void
  activeCall?: any
}

export default function CallCenter({
  stringeeAccessToken,
  userInfor,
  currentAppointment,
  isMinimized,
  onMinimize,
  activeCall
}: CallComponentProps) {
  console.log('currentAppointment', currentAppointment)
  const stringeeClientRef = useRef<any>(null)
  const activeCallRef = useRef<any>(null)
  const streamProcessedRef = useRef<boolean>(false)
  console.log('currentAppointment', currentAppointment)
  const [clientConnected, setClientConnected] = useState(false)
  const [calling, setCalling] = useState(false)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [callStatus, setCallStatus] = useState('Chưa bắt đầu')
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [pendingCall, setPendingCall] = useState<null | { video: boolean }>(
    null
  )

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const { closeComingCall } = useCallStore()
  // Sử dụng hook useCallListener để lấy setupCallEvents
  const { setupCallEvents, isCallRegistered } =
    useCallListener() as UseCallListenerResult

  // Đăng ký event cho cuộc gọi
  const registerCallEvents = useCallback((call: any) => {
    if (!call) return

    console.log('Đăng ký sự kiện cho cuộc gọi:', call.callId)

    // Xóa các listener cũ nếu đã đăng ký trước đó
    if (call.removeAllListeners) {
      call.removeAllListeners()
    }

    // Lấy các video element
    const remoteVideo = document.getElementById(
      'remoteVideo'
    ) as HTMLVideoElement | null
    const localVideo = document.getElementById(
      'localVideo'
    ) as HTMLVideoElement | null

    // Sự kiện khi có stream remote
    call.on('addremotestream', (stream: MediaStream) => {
      console.log('Nhận remote stream')
      if (!remoteVideo) {
        console.error('Không tìm thấy element remoteVideo')
        return
      }
      remoteVideo.srcObject = stream
      streamProcessedRef.current = true
      setIsVideoCall(true)
    })

    // Sự kiện khi có stream local
    call.on('addlocalstream', (stream: MediaStream) => {
      console.log('Nhận local stream', stream)
      if (!localVideo) {
        console.error('Không tìm thấy element localVideo')
        return
      }
      localVideo.srcObject = stream
    })

    // Sự kiện lỗi
    call.on('error', (info: any) => {
      console.error(`Lỗi cuộc gọi: ${JSON.stringify(info)}`)
      setCallStatus(`Lỗi: ${info.message || 'Không xác định'}`)
    })

    // Sự kiện trạng thái tín hiệu
    call.on('signalingstate', (state: any) => {
      console.log('Trạng thái tín hiệu:', state)

      if (state.reason) {
        setCallStatus(state.reason)
      }

      switch (state.code) {
        case 3: // Đang reo chuông
          setCallStatus('Đang đổ chuông...')
          break
        case 4: // Đã kết nối
          setCallStatus('Đã kết nối')
          setCalling(true)
          break
        case 5: // Bận
          setCallStatus('Người nhận bận')
          setCalling(false)
          break
        case 6: // Đã kết thúc
          setCallStatus('Cuộc gọi đã kết thúc')
          setCalling(false)
          activeCallRef.current = null
          break
        default:
          break
      }
    })

    // Sự kiện trạng thái media
    call.on('mediastate', (state: any) => {
      console.log('Trạng thái media:', state)

      if (state.video === 'connected') {
        console.log('Video đã kết nối')
        setIsVideoCall(true)
      }

      if (state.audio === 'connected') {
        console.log('Audio đã kết nối')
      }
    })

    call.on('info', (info: any) => {
      console.log(`Thông tin bổ sung: ${JSON.stringify(info)}`)
    })
  }, [])

  // Kết nối Stringee client và đăng ký các sự kiện
  useEffect(() => {
    if (!stringeeAccessToken) return

    if (typeof window !== 'undefined' && (window as any).StringeeClient) {
      const client = new (window as any).StringeeClient()
      stringeeClientRef.current = client

      client.connect(stringeeAccessToken)
      console.log('stringeeAccessToken', stringeeAccessToken)
      client.on('connect', () => {
        console.log('Stringee client đã kết nối')
        setClientConnected(true)
      })

      client.on('authenerror', () => {
        console.error('Lỗi xác thực Stringee')
        setClientConnected(false)
        setCallStatus('Lỗi xác thực')
      })

      client.on('disconnect', () => {
        console.warn('Stringee client bị ngắt kết nối')
        setClientConnected(false)
        setCallStatus('Mất kết nối')
      })

      client.on('incomingcall', (incomingCallObj: any) => {
        console.log('Có cuộc gọi đến', incomingCallObj.callId)
        const metadata = incomingCallObj.customData
          ? JSON.parse(incomingCallObj.customData)
          : {}

        // Nhận customDataFromYourServer nếu có
        if (incomingCallObj.customDataFromYourServer) {
          try {
            const customDataReceived = JSON.parse(
              incomingCallObj.customDataFromYourServer
            )
            console.log(
              'Nhận được customDataFromYourServer:',
              customDataReceived
            )

            // Xử lý dữ liệu từ customDataFromYourServer
            if (customDataReceived && customDataReceived.appointmentData) {
              console.log(
                'Đã nhận dữ liệu appointment từ customDataFromYourServer'
              )
            }
          } catch (error) {
            console.error('Lỗi khi parse customDataFromYourServer:', error)
          }
        }

        setIncomingCall(incomingCallObj)
        console.log('metadata check', metadata)

        // Sử dụng setupCallEvents từ hook
        if (setupCallEvents) {
          setupCallEvents(incomingCallObj)
        } else {
          registerCallEvents(incomingCallObj)
        }
      })
    }

    // Không cần return undefined ở đây
  }, [registerCallEvents, stringeeAccessToken, setupCallEvents])

  // Xử lý activeCall khi nhận từ store (do cuộc gọi đến đã được chấp nhận)
  useEffect(() => {
    if (activeCall && !activeCallRef.current) {
      console.log('Nhận activeCall từ store:', activeCall.callId || 'unknown')

      // Lưu cuộc gọi vào ref
      activeCallRef.current = activeCall

      // Cập nhật UI
      setCalling(true)
      setCallStatus('Đã kết nối cuộc gọi')
      setIsVideoCall(true)

      // Kiểm tra và xử lý thông tin custom data nếu có
      try {
        // Kiểm tra nhiều nguồn dữ liệu có thể
        const customDataSource =
          activeCall.customDataFromYourServer ||
          activeCall.custom ||
          activeCall.customData

        if (customDataSource) {
          console.log(
            'Tìm thấy custom data trong activeCall:',
            customDataSource
          )

          const customData =
            typeof customDataSource === 'string'
              ? JSON.parse(customDataSource)
              : customDataSource

          // Nếu có thông tin appointment và chưa có từ store
          if (customData && customData.appointmentData && !currentAppointment) {
            console.log(
              'Đã tìm thấy thông tin appointment từ customData:',
              customData.appointmentData
            )
            // Tại đây có thể thực hiện các hành động bổ sung với thông tin appointment
          }
        }
      } catch (error) {
        console.error('Lỗi khi xử lý custom data từ activeCall:', error)
      }

      // Nếu không có appointment, hiển thị thông báo cho người dùng
      if (!currentAppointment) {
        console.log('Không có thông tin appointment cho cuộc gọi này')
        setCallStatus('Kết nối thành công - không có thông tin cuộc hẹn')
      }

      // Đăng ký lại các sự kiện nếu sử dụng hook
      if (setupCallEvents) {
        // Kiểm tra xem cuộc gọi đã được đăng ký chưa
        const callAlreadyRegistered =
          isCallRegistered &&
          activeCall.callId &&
          isCallRegistered(activeCall.callId)

        if (!callAlreadyRegistered) {
          console.log('Đăng ký sự kiện cho cuộc gọi từ store')
          setupCallEvents(activeCall)
        } else {
          console.log('Cuộc gọi đã được đăng ký sự kiện:', activeCall.callId)
        }
      } else {
        registerCallEvents(activeCall)
      }

      // Đảm bảo stream được xử lý sau một khoảng thời gian ngắn nếu chưa
      setTimeout(() => {
        if (!streamProcessedRef.current && activeCallRef.current) {
          console.log('Thử lại việc xử lý streams')
          const remoteVideo = document.getElementById(
            'remoteVideo'
          ) as HTMLVideoElement | null
          const localVideo = document.getElementById(
            'localVideo'
          ) as HTMLVideoElement | null

          // Thủ công thêm stream nếu có
          if (activeCall._remoteStream && remoteVideo) {
            console.log('Thêm remote stream thủ công')
            remoteVideo.srcObject = activeCall._remoteStream
          }

          if (activeCall._localStream && localVideo) {
            console.log('Thêm local stream thủ công')
            localVideo.srcObject = activeCall._localStream
          }
        }
      }, 1000)
    }
  }, [
    activeCall,
    registerCallEvents,
    setupCallEvents,
    isCallRegistered,
    currentAppointment
  ])

  // Hàm gọi điện
  const makeCall = useCallback(
    (video = true) => {
      if (!clientConnected) {
        setCallStatus('Đang kết nối tới máy chủ, vui lòng chờ...')
        setPendingCall({ video })
        return
      }

      if (!currentAppointment) {
        setCallStatus('Không có thông tin cuộc hẹn để thực hiện cuộc gọi')
        return
      }

      const callFromId = userInfor?._id
      const callToId =
        userInfor?._id === currentAppointment?.doctor?._id
          ? currentAppointment?.patient?._id
          : currentAppointment?.doctor?._id

      if (!callToId) {
        setCallStatus('Không có thông tin người nhận')
        return
      }

      setIsVideoCall(video)
      console.log(`Đang gọi từ ${callFromId} đến ${callToId}`)

      setPendingCall(null)
      try {
        // Chuẩn bị dữ liệu appointment để gửi đi
        // Tạo phiên bản nhẹ của appointment để tránh dữ liệu quá lớn
        const simplifiedAppointment = {
          id: currentAppointment.id || currentAppointment._id,
          date: currentAppointment.date,
          slot: currentAppointment.slot,
          status: currentAppointment.status,
          doctor: {
            _id: currentAppointment.doctor?._id,
            fullName: currentAppointment.doctor?.fullName,
            avatarUrl: currentAppointment.doctor?.avatarUrl,
            specialtyName: currentAppointment.doctor?.specialtyName
          },
          patient: {
            _id: currentAppointment.patient?._id,
            fullName: currentAppointment.patient?.fullName,
            avatarUrl: currentAppointment.patient?.avatarUrl
          }
        }

        // Tạo custom data với thông tin đầy đủ
        const customData = JSON.stringify({
          appointmentData: simplifiedAppointment,
          callerRole: userInfor?.role
        })

        const call = new (window as any).StringeeCall(
          stringeeClientRef.current,
          callFromId,
          callToId,
          video
        )

        console.log('call', call)

        // Thiết lập custom data cho call - sử dụng cả hai phương thức
        call.custom = customData
        call.customDataFromYourServer = customData

        console.log('Đã gửi dữ liệu appointment:', customData)

        call.makeCall((res: any) => {
          if (res.r === 0) {
            console.log('Cuộc gọi bắt đầu thành công', call.callId)
            // Đăng ký sự kiện sau khi makeCall thành công
            if (setupCallEvents) {
              setupCallEvents(call)
            } else {
              registerCallEvents(call)
            }
            activeCallRef.current = call
            setCalling(true)
            setCallStatus('Đang gọi...')
            streamProcessedRef.current = false
          } else {
            console.error('Lỗi khi tạo cuộc gọi:', res)
            setCallStatus(`Gọi thất bại: ${res.message}`)
          }
        })
      } catch (error) {
        console.error('Lỗi không xác định khi gọi:', error)
        setCallStatus('Lỗi không xác định khi tạo cuộc gọi')
      }
    },
    [
      clientConnected,
      currentAppointment,
      registerCallEvents,
      setupCallEvents,
      userInfor
    ]
  )

  // Kết thúc cuộc gọi
  const endCall = useCallback(() => {
    if (activeCallRef.current) {
      console.log('Kết thúc cuộc gọi')
      try {
        activeCallRef.current.hangup()
        activeCallRef.current = null
        setCalling(false)
        setCallStatus('Đã kết thúc cuộc gọi')
        streamProcessedRef.current = false
      } catch (error) {
        console.error('Lỗi khi kết thúc cuộc gọi:', error)
        setCallStatus('Lỗi khi kết thúc cuộc gọi')
      }
    }
  }, [])

  // Trả lời cuộc gọi đến
  const answerIncomingCall = useCallback(() => {
    if (!incomingCall) return

    console.log('Trả lời cuộc gọi đến')
    setIsVideoCall(true)
    activeCallRef.current = incomingCall
    // Đảm bảo đăng ký sự kiện trước khi trả lời
    if (setupCallEvents) {
      // Kiểm tra xem đã đăng ký chưa
      const callAlreadyRegistered =
        isCallRegistered &&
        incomingCall.callId &&
        isCallRegistered(incomingCall.callId)

      if (!callAlreadyRegistered) {
        console.log('Đăng ký sự kiện trước khi trả lời cuộc gọi')
        setupCallEvents(incomingCall)
      }
    } else {
      // Nếu không có setupCallEvents từ hook, sử dụng hàm local
      registerCallEvents(incomingCall)
    }

    // Xử lý customDataFromYourServer
    try {
      if (incomingCall.customDataFromYourServer) {
        const customDataReceived = JSON.parse(
          incomingCall.customDataFromYourServer
        )
        console.log('customDataReceived', customDataReceived)

        // Xử lý dữ liệu appointment nếu có
        if (customDataReceived.appointmentData && !currentAppointment) {
          console.log('Đã nhận dữ liệu appointment từ customDataFromYourServer')
          // Có thể update UI hoặc state ở đây
        }
      } else if (incomingCall.custom) {
        console.log(
          'Nhận custom data từ incomingCall.custom:',
          incomingCall.custom
        )
      }
    } catch (error) {
      console.error('Lỗi khi xử lý customDataFromYourServer:', error)
    }

    try {
      // Trả lời cuộc gọi
      incomingCall.answer()
      setIncomingCall(null)
      setCalling(true)
      setCallStatus('Đã trả lời cuộc gọi')
      streamProcessedRef.current = false
      // Thêm timeout để kiểm tra và xử lý stream nếu cần
      setTimeout(() => {
        if (!streamProcessedRef.current && activeCallRef.current) {
          console.log('Kiểm tra lại streams sau khi trả lời')
          const remoteVideo = document.getElementById(
            'remoteVideo'
          ) as HTMLVideoElement | null
          const localVideo = document.getElementById(
            'localVideo'
          ) as HTMLVideoElement | null

          // Kiểm tra nhiều nguồn stream có thể
          const possibleRemoteStreams = [
            incomingCall._remoteStream,
            incomingCall.remoteStream,
            activeCallRef.current._remoteStream,
            activeCallRef.current.remoteStream
          ].filter(Boolean)

          const possibleLocalStreams = [
            incomingCall._localStream,
            incomingCall.localStream,
            activeCallRef.current._localStream,
            activeCallRef.current.localStream
          ].filter(Boolean)

          // Thử gán remote stream
          if (possibleRemoteStreams.length > 0 && remoteVideo) {
            console.log(
              'Gán remote stream thủ công sau khi trả lời',
              possibleRemoteStreams[0]
            )

            try {
              remoteVideo.srcObject = possibleRemoteStreams[0]
              remoteVideo.onloadedmetadata = () => {
                console.log('Remote video metadata loaded thủ công, playing...')
                remoteVideo.play().catch(err => {
                  console.error('Error playing remote video (thủ công):', err)
                })
              }
              streamProcessedRef.current = true
            } catch (error) {
              console.error('Lỗi khi gán remote stream thủ công:', error)
            }
          }

          // Thử gán local stream
          if (possibleLocalStreams.length > 0 && localVideo) {
            console.log(
              'Gán local stream thủ công sau khi trả lời',
              possibleLocalStreams[0]
            )

            try {
              localVideo.srcObject = possibleLocalStreams[0]
              localVideo.onloadedmetadata = () => {
                console.log('Local video metadata loaded thủ công, playing...')
                localVideo.play().catch(err => {
                  console.error('Error playing local video (thủ công):', err)
                })
              }
            } catch (error) {
              console.error('Lỗi khi gán local stream thủ công:', error)
            }
          }

          // Nếu vẫn không có stream, thử đăng ký lại sự kiện
          if (!remoteVideo?.srcObject && activeCallRef.current) {
            console.log('Thử đăng ký lại sự kiện sau khi trả lời')
            // Sử dụng setupCallEvents từ hook nếu có, nếu không thì dùng hàm local
            if (typeof setupCallEvents === 'function') {
              setupCallEvents(activeCallRef.current)
            } else {
              registerCallEvents(activeCallRef.current)
            }
          }
        }
      }, 1000)
    } catch (error) {
      console.error('Lỗi khi trả lời cuộc gọi:', error)
      setCallStatus('Lỗi khi trả lời cuộc gọi')
    }
  }, [
    incomingCall,
    currentAppointment,
    setupCallEvents,
    isCallRegistered,
    registerCallEvents
  ])

  // Từ chối cuộc gọi
  const rejectIncomingCall = useCallback(() => {
    if (incomingCall) {
      console.log('Từ chối cuộc gọi đến')
      try {
        incomingCall.reject()
        setIncomingCall(null)
        setCallStatus('Đã từ chối cuộc gọi')
      } catch (error) {
        console.error('Lỗi khi từ chối cuộc gọi:', error)
      }
    }
  }, [incomingCall])

  // Bật/tắt mic
  const mute = useCallback(() => {
    if (activeCallRef.current) {
      console.log('Bật/tắt mic:', !isMuted)
      try {
        activeCallRef.current.mute(!isMuted)
        setIsMuted(!isMuted)
      } catch (error) {
        console.error('Lỗi khi bật/tắt mic:', error)
      }
    }
  }, [isMuted])

  // Bật/tắt video
  const enableVideo = useCallback(() => {
    if (activeCallRef.current) {
      console.log('Bật/tắt video:', !isVideoEnabled)
      try {
        activeCallRef.current.enableVideo(!isVideoEnabled)
        setIsVideoEnabled(!isVideoEnabled)
      } catch (error) {
        console.error('Lỗi khi bật/tắt video:', error)
      }
    }
  }, [isVideoEnabled])

  // Khởi tạo các thông tin hiển thị
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

  // Giao diện thu nhỏ
  if (isMinimized) {
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

  // Giao diện chính
  return (
    <>
      <Box display="flex" flexDirection="column" gap={1}>
        <Box
          borderRadius={2}
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={{ xs: 2, sm: 3 }}
          bgcolor="white"
          boxShadow={3}
          p={{ xs: 1, sm: 2 }}
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
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
          width="100%"
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            width={{ xs: '100%', md: '70%' }}
          >
            <Box
              width="100%"
              borderRadius={2}
              overflow="hidden"
              boxShadow={3}
              position="relative"
              sx={{
                height: { xs: '40vh', sm: '50vh', md: '60vh' }
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
                    mt: { xs: 1, sm: 2 },
                    zIndex: 2
                  }}
                >
                  <CallTimer
                    isRunning={calling}
                    isConnected={clientConnected}
                    onEnd={duration => {
                      console.log('Call ended in', duration, 's')
                    }}
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
                    objectFit: 'cover'
                  }}
                >
                  <track kind="captions" src="" label="English" />
                </video>
                {isVideoCall ||
                  (clientConnected && (
                    <Box
                      sx={{
                        width: { xs: 80, sm: 100 },
                        height: { xs: 80, sm: 100 },
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: 20, sm: 24 },
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

              {/* Local Video */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: { xs: 8, sm: 16 },
                  right: { xs: 8, sm: 16 },
                  width: { xs: '120px', sm: '180px' },
                  height: { xs: '80px', sm: '120px' },
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
                        width: { xs: 60, sm: 100 },
                        height: { xs: 60, sm: 100 },
                        borderRadius: '50%',
                        backgroundColor: '#424141',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: 18, sm: 24 },
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

            {/* Call Status */}
            {callStatus && (
              <Box
                sx={{
                  fontSize: { xs: 14, sm: 16 },
                  width: '100%',
                  fontWeight: 'bold',
                  p: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  backgroundColor: '#dfdfdf',
                  color: 'black',
                  textAlign: 'center'
                }}
              >
                {callStatus}
              </Box>
            )}

            {/* Control Buttons */}
            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 2 }}
              p={{ xs: 1, sm: 2 }}
              justifyContent="center"
              flexWrap="wrap"
              borderRadius={2}
              boxShadow={2}
              bgcolor="white"
              width="100%"
              sx={{
                '& > button': {
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
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
              {/* Control buttons with responsive icons */}
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
                  width={isMobile ? 16 : 18}
                  height={isMobile ? 16 : 18}
                />
              </Button>

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
                  width={isMobile ? 16 : 18}
                  height={isMobile ? 16 : 18}
                />
              </Button>

              <Button
                variant="contained"
                onClick={() => makeCall(true)}
                disabled={calling || !clientConnected}
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
                <Icon
                  icon="mdi:phone"
                  width={isMobile ? 16 : 18}
                  height={isMobile ? 16 : 18}
                />
              </Button>

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
                <Icon
                  icon="mdi:phone-hangup"
                  width={isMobile ? 16 : 18}
                  height={isMobile ? 16 : 18}
                />
              </Button>
            </Stack>
          </Box>

          {/* Chat Box */}
          <Box
            width={{ xs: '100%', md: '30%' }}
            sx={{
              display: {
                xs: isMobile && calling ? 'none' : 'block',
                md: 'block'
              }
            }}
          >
            <CallChatBox
              currentUser={userInfor?._id || 'Bạn'}
              peerUser={
                userInfor?.role === 'DOCTOR'
                  ? currentAppointment?.patient?._id
                  : currentAppointment?.doctor?._id
              }
              userInfor={userInfor}
              appointmentId={
                currentAppointment?._id || currentAppointment?.id || ''
              }
            />
          </Box>
        </Box>
      </Box>
      {/* Incoming Call Dialog */}
      {!closeComingCall && (
        <IncomingCall
          incomingCall={incomingCall}
          currentAppointment={currentAppointment}
          callerInfo={{
            name:
              incomingCall?.fromAlias ||
              (incomingCall?.customData
                ? JSON.parse(incomingCall.customData).appointmentData?.doctor
                    ?.fullName
                : 'Người gọi'),
            role: incomingCall?.customData
              ? JSON.parse(incomingCall.customData).callerRole
              : '',
            avatarUrl: incomingCall?.customData
              ? JSON.parse(incomingCall.customData).appointmentData?.doctor
                  ?.avatarUrl
              : '',
            specialtyName: incomingCall?.customData
              ? JSON.parse(incomingCall.customData).appointmentData?.doctor
                  ?.specialtyName
              : ''
          }}
          onAnswer={answerIncomingCall}
          onReject={rejectIncomingCall}
        />
      )}
    </>
  )
}

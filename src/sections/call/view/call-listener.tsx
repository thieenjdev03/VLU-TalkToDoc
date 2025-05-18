import { useRef, useState, useEffect } from 'react'

import CallCenterModal from './call-center-modal'
import IncomingCallPopup from './call-incomming-popup'

interface IncomingCall {
  fullName: string
  avatarUrl?: string
  role: 'doctor' | 'patient'
  specialtyName?: string
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

  call.on('signalingstate', (state: any) => {
    console.log('signalingstate ', state)
    if (state.reason && typeof state.reason === 'string') {
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
    }
  })
}

function CallListener() {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const stringeeAccessToken = JSON.parse(
    localStorage.getItem('stringeeToken') || '{}'
  )
  const stringeeClientRef = useRef<any>(null)
  const [clientConnected, setClientConnected] = useState(false)
  const [callStatus, setCallStatus] = useState('')
  const [openCall, setOpenCall] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<any>(null)
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
  console.log('openCall', openCall)
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

  const handleAccept = () => {
    setIncomingCall(null)
    setOpenCall(true)
  }

  const handleReject = () => {
    // TODO: Xử lý khi từ chối cuộc gọi (ví dụ: gửi tín hiệu reject, đóng popup)
    setIncomingCall(null)
  }

  const handleCloseCallCenter = () => {
    setOpenCall(false)
  }

  if (!incomingCall) return null

  return (
    <>
      <IncomingCallPopup
        isOpen={!!incomingCall}
        fullName={incomingCall.fullName}
        avatarUrl={incomingCall.avatarUrl}
        role={incomingCall.role}
        specialtyName={incomingCall.specialtyName}
        onAccept={handleAccept}
        onReject={handleReject}
      />

      <CallCenterModal
        callStatus="Ended"
        open={openCall}
        onClose={handleCloseCallCenter}
        stringeeAccessToken={stringeeAccessToken || ''}
        fromUserId={userProfile?._id || ''}
        userInfor={userProfile}
        currentAppointment={currentAppointment}
      />
    </>
  )
}

export default CallListener

import { useRef, useEffect, useCallback } from 'react'

import { useCallStore } from 'src/store/call-store'

export function useCallListener() {
  const stringeeClientRef = useRef<any>(null)
  // Thêm ref để theo dõi cuộc gọi đã đăng ký các sự kiện
  const registeredCallsRef = useRef<Set<string>>(new Set())

  const {
    setStringeeClient,
    handleIncomingCall,
    setIncomingCall,
    setActiveCall,
    setCustomData
  } = useCallStore()

  // Trích xuất thông tin người gọi từ cuộc gọi đến
  const extractCallerInfo = useCallback((call: any, userProfile: any) => {
    try {
      // Mặc định là thông tin cơ bản
      const defaultInfo = {
        fullName: call.fromAlias || call.from || 'Người gọi',
        avatarUrl: '',
        // Nếu người dùng hiện tại là bác sĩ, người gọi là bệnh nhân và ngược lại
        role: userProfile?.role === 'DOCTOR' ? 'patient' : 'doctor',
        specialtyName: ''
      }

      return defaultInfo
    } catch (error) {
      console.error('Error extracting caller info:', error)
      return {
        fullName: 'Người gọi',
        avatarUrl: '',
        role: 'patient',
        specialtyName: ''
      }
    }
  }, [])

  // Lấy thông tin hồ sơ người dùng
  const getUserProfile = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('userProfile') || '{}')
    } catch (e) {
      console.error('Error parsing user profile:', e)
      return {}
    }
  }, [])

  // Hàm thiết lập các sự kiện cho cuộc gọi
  const setupCallEvents = useCallback(
    (call: any) => {
      if (!call) {
        console.error('Call object is null or undefined in setupCallEvents')
        return
      }

      if (!call.callId) {
        console.error('Call object has no callId in setupCallEvents:', call)
        return
      }

      // Kiểm tra xem cuộc gọi đã được đăng ký sự kiện chưa
      if (registeredCallsRef.current.has(call.callId)) {
        console.log(
          `[CallEvent] Call ${call.callId} already has events registered, skipping...`
        )
        return
      }

      console.log(`[CallEvent] Setting up call events for call: ${call.callId}`)

      try {
        // Xóa tất cả các sự kiện cũ (nếu có) để tránh đăng ký nhiều lần
        if (call.removeAllListeners) {
          call.removeAllListeners()
        }

        // Đánh dấu cuộc gọi này đã được đăng ký sự kiện
        registeredCallsRef.current.add(call.callId)
        console.log(
          `[CallEvent] Registered events for call: ${call.callId}. Total registered calls: ${registeredCallsRef.current.size}`
        )

        // Lấy các video element
        const remoteVideo = document.getElementById(
          'remoteVideo'
        ) as HTMLVideoElement | null
        const localVideo = document.getElementById(
          'localVideo'
        ) as HTMLVideoElement | null

        // Sự kiện khi có stream remote
        call.on('addremotestream', (stream: MediaStream) => {
          console.log(
            `[CallEvent] Received remote stream for call: ${call.callId}`
          )
          if (!remoteVideo) {
            console.error('[CallEvent] Remote video element not found')
            return
          }
          try {
            remoteVideo.srcObject = stream
            console.log('[CallEvent] Remote stream attached successfully')
          } catch (error) {
            console.error('[CallEvent] Error attaching remote stream:', error)
          }
        })

        // Sự kiện khi có stream local
        call.on('addlocalstream', (stream: MediaStream) => {
          console.log(
            `[CallEvent] Received local stream for call: ${call.callId}`
          )
          if (!localVideo) {
            console.error('[CallEvent] Local video element not found')
            return
          }
          try {
            localVideo.srcObject = stream
            console.log('[CallEvent] Local stream attached successfully')
          } catch (error) {
            console.error('[CallEvent] Error attaching local stream:', error)
          }
        })

        // Sự kiện lỗi
        call.on('error', (info: any) => {
          console.error(
            `[CallEvent] Call error for ${call.callId}: ${JSON.stringify(info)}`
          )
        })

        // Sự kiện trạng thái tín hiệu
        call.on('signalingstate', (state: any) => {
          console.log(
            `[CallEvent] Signaling state change: ${state.code} (${state.reason}) for call: ${call.callId}`
          )

          // Xử lý khi cuộc gọi kết thúc hoặc thay đổi trạng thái
          switch (state.code) {
            case 3: // Ringing
              console.log('[CallEvent] Call is ringing')
              break
            case 4: // Answered
              console.log('[CallEvent] Call answered')
              setActiveCall(call)
              break
            case 5: // Busy
              console.log('[CallEvent] Recipient is busy')
              break
            case 6: // Ended
              console.log(`[CallEvent] Call ended: ${call.callId}`)
              // Xóa khỏi danh sách đã đăng ký khi kết thúc cuộc gọi
              if (call.callId) {
                registeredCallsRef.current.delete(call.callId)
                console.log(
                  `[CallEvent] Removed registration for ended call: ${call.callId}. Remaining registered calls: ${registeredCallsRef.current.size}`
                )
              }
              setActiveCall(null)
              break
            default:
              console.log(`[CallEvent] Unknown signaling state: ${state.code}`)
              break
          }
        })

        // Sự kiện trạng thái media
        call.on('mediastate', (state: any) => {
          console.log(
            `[CallEvent] Media state change: ${JSON.stringify(state)} for call: ${call.callId}`
          )

          // Xử lý khi trạng thái media thay đổi
          if (state.video === 'connected') {
            console.log('[CallEvent] Video connected successfully')
          }

          if (state.audio === 'connected') {
            console.log('[CallEvent] Audio connected successfully')
          }
        })

        // Sự kiện thông tin bổ sung
        call.on('info', (info: any) => {
          console.log(
            `[CallEvent] Call info for ${call.callId}: ${JSON.stringify(info)}`
          )
        })

        // Sự kiện từ thiết bị khác
        call.on('otherdevice', (data: any) => {
          console.log(
            `[CallEvent] Other device event for ${call.callId}: ${JSON.stringify(data)}`
          )
          if (data.type === 'CALL_END') {
            console.log('[CallEvent] Call ended by other device')
            // Xóa khỏi danh sách đã đăng ký
            if (call.callId) {
              registeredCallsRef.current.delete(call.callId)
              console.log(
                `[CallEvent] Removed registration for call ended by other device: ${call.callId}. Remaining calls: ${registeredCallsRef.current.size}`
              )
            }
            setActiveCall(null)
          }
        })

        // Xử lý khi cuộc gọi bị hủy hoặc kết thúc
        call.on('disconnect', () => {
          console.log(`[CallEvent] Call disconnected: ${call.callId}`)
          // Xóa khỏi danh sách đã đăng ký khi kết thúc cuộc gọi
          if (call.callId) {
            registeredCallsRef.current.delete(call.callId)
            console.log(
              `[CallEvent] Removed registration for disconnected call: ${call.callId}. Remaining calls: ${registeredCallsRef.current.size}`
            )
          }
        })
      } catch (error) {
        console.error('[CallEvent] Error setting up call events:', error)
        // Đảm bảo xóa khỏi danh sách nếu có lỗi
        if (call.callId) {
          registeredCallsRef.current.delete(call.callId)
          console.log(
            `[CallEvent] Removed registration due to error: ${call.callId}. Remaining calls: ${registeredCallsRef.current.size}`
          )
        }
      }
    },
    [setActiveCall]
  )

  // Hàm xóa sự kiện cuộc gọi khi cần thiết
  const cleanupCallEvents = useCallback((call: any) => {
    if (!call || !call.callId) return

    console.log(`[CallEvent] Cleaning up call events for call: ${call.callId}`)

    try {
      if (call.removeAllListeners) {
        call.removeAllListeners()
      }
      registeredCallsRef.current.delete(call.callId)
      console.log(
        `[CallEvent] Successfully cleaned up events for call: ${call.callId}. Remaining calls: ${registeredCallsRef.current.size}`
      )
    } catch (error) {
      console.error('[CallEvent] Error cleaning up call events:', error)
    }
  }, [])

  // Khởi tạo và kết nối Stringee client
  useEffect(() => {
    console.log('[CallEvent] Initializing Stringee client')
    // Lấy token từ localStorage
    let stringeeAccessToken
    try {
      stringeeAccessToken = JSON.parse(
        localStorage.getItem('stringeeToken') || '{}'
      )
    } catch (error) {
      console.error('[CallEvent] Error parsing stringeeToken:', error)
      return // Kết thúc sớm nếu có lỗi
    }

    if (!stringeeAccessToken) {
      console.warn('[CallEvent] No Stringee token found')
      return
    }

    // Khởi tạo client nếu có Stringee SDK
    if (typeof window !== 'undefined' && (window as any).StringeeClient) {
      // Nếu đã có client, ngắt kết nối trước
      if (stringeeClientRef.current) {
        try {
          stringeeClientRef.current.disconnect()
        } catch (error) {
          console.error(
            '[CallEvent] Error disconnecting existing client:',
            error
          )
        }
      }

      const client = new (window as any).StringeeClient()
      stringeeClientRef.current = client

      // Lưu client vào store để các component khác có thể sử dụng
      setStringeeClient(client)

      // Kết nối
      client.connect(stringeeAccessToken)

      // Xử lý các sự kiện
      client.on('connect', () => {
        console.log('[CallEvent] Stringee client connected successfully')
      })

      client.on('authenerror', () => {
        console.error('[CallEvent] Stringee auth error - token may be invalid')
      })

      client.on('disconnect', () => {
        console.log('[CallEvent] Stringee client disconnected')
      })

      // Xử lý cuộc gọi đến
      client.on('incomingcall', (incomingCallObj: any) => {
        console.log(
          `[CallEvent] Incoming call received: ${incomingCallObj.callId}`
        )
        console.log(
          '[CallEvent] Incoming call received full object:',
          incomingCallObj
        )

        // Kiểm tra xem cuộc gọi đã được đăng ký sự kiện chưa
        if (
          incomingCallObj.callId &&
          registeredCallsRef.current.has(incomingCallObj.callId)
        ) {
          console.log(
            `[CallEvent] Incoming call ${incomingCallObj.callId} already registered, skipping duplicate event`
          )
          return
        }

        // Lấy thông tin từ cuộc gọi đến
        const userProfile = getUserProfile()
        const callerInfo = extractCallerInfo(incomingCallObj, userProfile)

        // Xử lý custom data từ nhiều nguồn có thể
        let customDataReceived = null
        let appointmentData = null

        try {
          // Kiểm tra nhiều vị trí có thể chứa custom data
          const customDataSource =
            incomingCallObj.customDataFromYourServer ||
            incomingCallObj.custom ||
            incomingCallObj.customData

          if (customDataSource) {
            // Parse nếu là string, hoặc sử dụng trực tiếp nếu là object
            customDataReceived =
              typeof customDataSource === 'string'
                ? JSON.parse(customDataSource)
                : customDataSource

            console.log('[CallEvent] Custom data received:', customDataReceived)

            // Lưu vào store để các component khác có thể truy cập
            setCustomData(customDataReceived)

            // Trích xuất thông tin cuộc hẹn nếu có
            if (customDataReceived.appointmentData) {
              appointmentData = customDataReceived.appointmentData
              console.log(
                '[CallEvent] Appointment data found in custom data:',
                appointmentData
              )
            }

            // Cập nhật thông tin người gọi nếu có
            if (customDataReceived.callerInfo) {
              Object.assign(callerInfo, customDataReceived.callerInfo)
              console.log(
                '[CallEvent] Updated caller info with custom data:',
                callerInfo
              )
            }
          }
        } catch (error) {
          console.error(
            '[CallEvent] Error processing custom data from incoming call:',
            error
          )
        }

        // Lưu thông tin cuộc gọi đến vào store
        setIncomingCall(incomingCallObj)

        // Xử lý thông tin cuộc gọi đến với thông tin phụ
        handleIncomingCall(incomingCallObj, callerInfo, appointmentData)

        // Thiết lập sự kiện cho cuộc gọi đến
        setupCallEvents(incomingCallObj)
      })

      // Lưu ref để sử dụng trong cleanup
      const currentRegisteredCalls = new Set(registeredCallsRef.current)

      // Cleanup khi unmount
      return () => {
        console.log(
          '[CallEvent] Cleaning up Stringee client and registered calls'
        )

        // Xóa tất cả các sự kiện đã đăng ký
        currentRegisteredCalls.forEach(callId => {
          console.log(`[CallEvent] Cleaning up registered call: ${callId}`)
        })
        registeredCallsRef.current.clear()

        try {
          if (stringeeClientRef.current) {
            stringeeClientRef.current.disconnect()
            stringeeClientRef.current = null
          }
        } catch (error) {
          console.error(
            '[CallEvent] Error disconnecting Stringee client:',
            error
          )
        }
      }
    }
    console.error('[CallEvent] Stringee SDK not found in window object')
    // Trả về hàm cleanup rỗng để tránh lỗi linter
    return () => {}
  }, [
    setStringeeClient,
    handleIncomingCall,
    setIncomingCall,
    setCustomData,
    setupCallEvents,
    getUserProfile,
    extractCallerInfo
  ])

  return {
    stringeeClient: stringeeClientRef.current,
    setupCallEvents,
    cleanupCallEvents,
    // Thêm thông tin để component biết call nào đã được đăng ký sự kiện
    isCallRegistered: (callId: string) => registeredCallsRef.current.has(callId)
  }
}

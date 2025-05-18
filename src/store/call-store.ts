import { create } from 'zustand'

// Định nghĩa interface cho state của call store
interface CallState {
  isCallOpen: boolean
  incomingCall: any | null
  activeCall: any | null
  currentAppointment: any | null
  showRatingModal: boolean
  stringeeClient: any | null
  customData: any | null
  callerInfo: {
    fullName: string
    avatarUrl?: string
    role: 'doctor' | 'patient'
    specialtyName?: string
    appointmentId?: string
  } | null

  // Actions
  setStringeeClient: (client: any) => void
  openCall: (appointment: any) => void
  closeCall: () => void
  setIncomingCall: (call: any) => void
  setCustomData: (customData: any) => void
  setActiveCall: (call: any) => void
  handleIncomingCall: (
    call: any,
    callerInfo?: any,
    appointmentData?: any
  ) => void
  acceptIncomingCall: () => void
  rejectIncomingCall: () => void
  openRatingModal: () => void
  closeRatingModal: () => void
  setCurrentAppointment: (appointment: any) => void
  fetchAppointmentByCallerId: (callerId: string) => Promise<any>
}

// Hàm lấy thông tin từ localStorage
const getUserProfile = () => {
  try {
    return JSON.parse(localStorage.getItem('userProfile') || '{}')
  } catch (e) {
    return {}
  }
}

// Khởi tạo zustand store
export const useCallStore = create<CallState>((set, get) => ({
  isCallOpen: false,
  incomingCall: null,
  activeCall: null,
  currentAppointment: null,
  showRatingModal: false,
  stringeeClient: null,
  customData: null,
  callerInfo: null,

  // Actions để quản lý client
  setStringeeClient: client => set({ stringeeClient: client }),

  // Set activeCall
  setActiveCall: call => set({ activeCall: call }),

  // Mở call với appointment thông thường
  openCall: appointment =>
    set({
      isCallOpen: true,
      currentAppointment: appointment,
      showRatingModal: false
    }),

  // Đóng call và reset state
  closeCall: () => {
    const { activeCall } = get()

    // Nếu có cuộc gọi đang diễn ra, kết thúc nó
    if (activeCall) {
      try {
        activeCall.hangup()
      } catch (error) {
        console.error('Lỗi khi kết thúc cuộc gọi:', error)
      }
    }

    set(state => ({
      isCallOpen: false,
      showRatingModal: !!state.currentAppointment, // Hiện rating nếu có appointment
      incomingCall: null,
      activeCall: null // Reset activeCall khi đóng
    }))
  },

  // Chỉ lưu incomingCall
  setIncomingCall: call => set({ incomingCall: call }),
  setCustomData: customData => set({ customData }),
  // Thiết lập appointment cho cuộc gọi
  setCurrentAppointment: appointment =>
    set({ currentAppointment: appointment }),

  // Lấy thông tin appointment từ ID người gọi
  fetchAppointmentByCallerId: async callerId => {
    try {
      const userProfile = getUserProfile()
      console.log('Tìm appointment từ người gọi:', callerId)
      console.log('User hiện tại:', userProfile._id)

      // Tìm cuộc hẹn trong localStorage nếu có
      const appointments = JSON.parse(
        localStorage.getItem('appointments') || '[]'
      )

      // Nếu người dùng là bác sĩ, tìm cuộc hẹn với bệnh nhân
      // Nếu người dùng là bệnh nhân, tìm cuộc hẹn với bác sĩ
      const foundAppointment = appointments.find((appointment: any) => {
        if (userProfile.role === 'DOCTOR') {
          return appointment.patient?._id === callerId
        }
        return appointment.doctor?._id === callerId
      })

      if (foundAppointment) {
        console.log('Đã tìm thấy appointment cho cuộc gọi:', foundAppointment)
        set({ currentAppointment: foundAppointment })
        return foundAppointment
      }

      console.log('Không tìm thấy appointment cho người gọi:', callerId)
      return null
    } catch (error) {
      console.error('Lỗi khi tìm appointment:', error)
      return null
    }
  },

  // Khi nhận được cuộc gọi đến
  handleIncomingCall: (call, callerInfo, appointmentData) => {
    // Lấy thông tin người gọi
    const userProfile = getUserProfile()

    // Mặc định - có thể cập nhật nếu có thông tin thực tế từ server
    const defaultCallerInfo = {
      fullName: call.fromAlias || 'Người gọi',
      avatarUrl: '',
      role: userProfile?.role === 'DOCTOR' ? 'patient' : 'doctor',
      specialtyName: '',
      appointmentId: '' // Sẽ lấy từ custom data nếu có
    }

    // Sử dụng thông tin được cung cấp hoặc mặc định
    const finalCallerInfo = callerInfo || defaultCallerInfo

    // Xử lý custom data nếu có
    try {
      if (call.custom) {
        console.log('Nhận được custom data:', call.custom)
        const customData = JSON.parse(call.custom)

        // Nếu có dữ liệu appointment đầy đủ
        if (customData.appointmentData) {
          console.log(
            'Đã nhận được dữ liệu appointment:',
            customData.appointmentData
          )
          // Thiết lập appointment
          set({ currentAppointment: customData.appointmentData })

          // Cập nhật thông tin người gọi
          if (
            customData.appointmentData.doctor &&
            customData.appointmentData.patient
          ) {
            // Xác định role của người gọi từ custom data
            const isCallerDoctor = customData.callerRole === 'DOCTOR'

            // Lấy thông tin từ appointment dựa trên role
            if (isCallerDoctor && userProfile?.role !== 'DOCTOR') {
              finalCallerInfo.fullName =
                customData.appointmentData.doctor.fullName ||
                finalCallerInfo.fullName
              finalCallerInfo.avatarUrl =
                customData.appointmentData.doctor.avatarUrl ||
                finalCallerInfo.avatarUrl
              finalCallerInfo.specialtyName =
                customData.appointmentData.doctor.specialtyName ||
                finalCallerInfo.specialtyName
            } else if (!isCallerDoctor && userProfile?.role === 'DOCTOR') {
              finalCallerInfo.fullName =
                customData.appointmentData.patient.fullName ||
                finalCallerInfo.fullName
              finalCallerInfo.avatarUrl =
                customData.appointmentData.patient.avatarUrl ||
                finalCallerInfo.avatarUrl
            }
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý custom data:', error)
    }

    set({
      incomingCall: call,
      callerInfo: finalCallerInfo
    })

    // Nếu đã có thông tin appointment, cập nhật luôn
    if (appointmentData && !get().currentAppointment) {
      set({ currentAppointment: appointmentData })
    } else if (call.from && !get().currentAppointment) {
      // Nếu không, thử tìm appointment dựa trên ID người gọi
      get().fetchAppointmentByCallerId(call.from)
    }
  },
  // Đồng ý cuộc gọi đến
  acceptIncomingCall: () => {
    const { incomingCall, callerInfo } = get()
    if (incomingCall) {
      // Trước khi trả lời, kiểm tra và xử lý dữ liệu từ customDataFromYourServer
      let appointmentData = null

      try {
        // Kiểm tra các nguồn dữ liệu khác nhau
        const customDataSource =
          incomingCall.customDataFromYourServer ||
          incomingCall.custom ||
          incomingCall.customData

        if (customDataSource) {
          const customData =
            typeof customDataSource === 'string'
              ? JSON.parse(customDataSource)
              : customDataSource

          console.log('Custom data từ cuộc gọi đến:', customData)

          // Trích xuất thông tin appointment nếu có
          if (customData && customData.appointmentData) {
            appointmentData = customData.appointmentData
            console.log('Đã tìm thấy appointmentData:', appointmentData)

            // Cập nhật trực tiếp vào store
            set({ currentAppointment: appointmentData })
          }
        }
      } catch (error) {
        console.error(
          'Lỗi khi xử lý custom data trong acceptIncomingCall:',
          error
        )
      }

      // Nếu không tìm thấy appointment từ custom data, tìm dựa trên ID người gọi
      if (!get().currentAppointment && !appointmentData && incomingCall.from) {
        get().fetchAppointmentByCallerId(incomingCall.from)
      }

      // Trả lời cuộc gọi sử dụng Stringee SDK
      try {
        incomingCall.answer()
        console.log('Đã chấp nhận cuộc gọi:', incomingCall.callId)

        // Cập nhật state - lưu incomingCall vào activeCall
        set({
          isCallOpen: true,
          activeCall: incomingCall, // Lưu incomingCall vào activeCall
          incomingCall: null
        })
      } catch (error) {
        console.error('Lỗi khi trả lời cuộc gọi:', error)
      }
    }
  },

  // Từ chối cuộc gọi đến
  rejectIncomingCall: () => {
    const { incomingCall } = get()
    if (incomingCall) {
      // Từ chối cuộc gọi sử dụng Stringee SDK
      try {
        incomingCall.reject()
      } catch (error) {
        console.error('Lỗi khi từ chối cuộc gọi:', error)
      }

      // Cập nhật state
      set({
        incomingCall: null,
        callerInfo: null
      })
    }
  },

  // Mở modal đánh giá
  openRatingModal: () => set({ showRatingModal: true }),

  // Đóng modal đánh giá và reset appointment
  closeRatingModal: () =>
    set({
      showRatingModal: false,
      currentAppointment: null
    })
}))

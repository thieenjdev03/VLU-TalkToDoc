'use client'

import { memo, useEffect } from 'react'

import { Box, useTheme, useMediaQuery } from '@mui/material'

import { useCallListener } from 'src/hooks/use-call-listener'

import { useCallStore } from 'src/store/call-store'

import DoctorRating from 'src/sections/appointment/appointment-rating-doctor'

import CallCenterModal from './call-center-modal'
import IncomingCallPopup from './call-incomming-popup'

function CallListener() {
  // Gọi hook để khởi tạo và lắng nghe sự kiện cuộc gọi
  useCallListener()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Lấy state và actions từ store
  const {
    isCallOpen,
    incomingCall,
    callerInfo,
    showRatingModal,
    currentAppointment,
    openCall,
    closeCall,
    acceptIncomingCall,
    rejectIncomingCall,
    closeRatingModal,
    fetchAppointmentByCallerId
  } = useCallStore()

  // Lấy thông tin người dùng
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')

  // Lấy token stringee
  const stringeeToken = JSON.parse(
    localStorage.getItem('stringeeToken') || '{}'
  )

  // Tự động tìm thông tin cuộc hẹn khi có cuộc gọi đến
  useEffect(() => {
    if (incomingCall && !currentAppointment && incomingCall.from) {
      console.log('Tự động tìm thông tin cuộc hẹn cho cuộc gọi đến')
      fetchAppointmentByCallerId(incomingCall.from)
    }
  }, [incomingCall, currentAppointment, fetchAppointmentByCallerId])

  // Xử lý submit đánh giá
  const handleSubmitRating = async (rating: number, comment: string) => {
    closeRatingModal()
  }

  // Tạo thông tin cuộc hẹn để hiển thị
  const getAppointmentInfo = () => {
    if (!currentAppointment) return ''

    let info = `Cuộc hẹn: ${currentAppointment.date || ''} ${currentAppointment.slot || ''}`

    // Thêm thông tin trạng thái nếu có
    if (currentAppointment.status) {
      const statusMap: Record<string, string> = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        completed: 'Đã hoàn thành',
        cancelled: 'Đã hủy'
      }
      const statusText =
        statusMap[currentAppointment.status] || currentAppointment.status
      info += ` - ${statusText}`
    }

    // Thêm thông tin dịch vụ nếu có
    if (currentAppointment.serviceName) {
      info += ` - ${currentAppointment.serviceName}`
    }

    return info
  }

  return (
    <>
      {/* Hiển thị thông báo cuộc gọi đến */}
      {incomingCall && !isCallOpen && callerInfo && (
        <IncomingCallPopup
          isOpen={!!incomingCall}
          fullName={callerInfo.fullName}
          avatarUrl={callerInfo.avatarUrl}
          role={callerInfo.role}
          specialtyName={callerInfo.specialtyName}
          appointmentInfo={getAppointmentInfo()}
          onAccept={acceptIncomingCall}
          onReject={rejectIncomingCall}
        />
      )}

      {/* Modal cuộc gọi */}
      {isCallOpen && (
        <CallCenterModal
          open={isCallOpen}
          onClose={closeCall}
          callStatus=""
          stringeeAccessToken={stringeeToken || ''}
          fromUserId={userProfile?._id || ''}
          userInfor={userProfile}
          currentAppointment={currentAppointment}
        />
      )}

      {/* Modal đánh giá sau cuộc gọi */}
      {showRatingModal &&
        currentAppointment &&
        userProfile?.role !== 'DOCTOR' && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0,0,0,0.5)'
              }}
              onClick={closeRatingModal}
            />
            <Box
              sx={{
                position: 'relative',
                zIndex: 1400,
                mb: 15,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DoctorRating
                doctorName={currentAppointment?.doctor?.fullName || ''}
                doctorAvatar={currentAppointment?.doctor?.avatarUrl || ''}
                onSubmit={handleSubmitRating}
                onClose={closeRatingModal}
                doctorId={currentAppointment?.doctor?._id || ''}
                appointmentId={currentAppointment?._id || ''}
              />
            </Box>
          </Box>
        )}
    </>
  )
}

export default memo(CallListener)

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { Button, Container, Typography } from '@mui/material'

import { paths } from 'src/routes/paths'

import { submitCase } from 'src/api/case'

import {
  updateAppointment,
  getAppointmentById
} from 'src/sections/create-booking/api'

import VnPayReturnPage from '../payment-vnpay-return-page'

export default function PaymentView() {
  const navigate = useNavigate()
  const currentPath = useLocation()
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null)

  useEffect(() => {
    const handleSubmitPaid = async () => {
      const currentCase = JSON.parse(
        localStorage.getItem('currentCase') || '{}'
      )
      const submitPaid = async () => {
        await submitCase({
          case_id: currentCase?._id,
          action: 'submit',
          appointment_id: currentCase?.appointmentId?._id
        })
        await updateAppointment({
          appointmentId: currentCase?.appointmentId?._id,
          data: {
            patient: currentCase?.patient,
            doctor: currentCase?.doctor,
            slot: currentCase?.slot,
            date: currentCase?.date,
            timezone: currentCase?.timezone,
            payment: {
              ...currentCase?.payment,
              status: 'PAID'
            }
          }
        })
      }
      if (currentCase) {
        const appointment = await getAppointmentById({
          appointmentId: currentCase?.appointmentId?._id
        })
        setAppointmentDetails(appointment)
        submitPaid()
      }
    }
    handleSubmitPaid()
  }, [currentPath, paymentSuccess])

  return (
    <Container
      sx={{
        pt: 15,
        pb: 10,
        minHeight: '100vh',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {(() => {
        if (
          currentPath.search.includes('vnp_Amount') &&
          paymentSuccess === false
        ) {
          return <VnPayReturnPage setPaymentSuccess={setPaymentSuccess} />
        }
        if (
          currentPath.search.includes('vnp_Amount') &&
          paymentSuccess === false
        ) {
          return (
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center mb-4">
                <svg
                  className="text-red-500 w-20 h-20 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <Typography variant="h3" gutterBottom>
                Thanh toán thất bại!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}
              >
                Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại
                hoặc liên hệ hỗ trợ.
              </Typography>
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  variant="outlined"
                  onClick={() => {
                    navigate(paths.dashboard.root)
                    localStorage.removeItem('currentCase')
                  }}
                >
                  Về trang chính
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate(paths.dashboard.appointment.list)
                    localStorage.removeItem('currentCase')
                  }}
                >
                  Xem danh sách lịch hẹn
                </Button>
              </div>
            </div>
          )
        }
        if (
          currentPath.search.includes('vnp_Amount') &&
          paymentSuccess === true
        ) {
          return (
            <>
              <div className="flex items-center justify-center mb-4">
                <svg
                  className="text-green-500 w-20 h-20 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <Typography variant="h3" gutterBottom>
                Thanh toán thành công!
              </Typography>
              {appointmentDetails && (
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}
                >
                  Thông tin lịch hẹn:
                  <br />
                  Mã lịch hẹn: {appointmentDetails.appointmentId}
                  <br />
                  Bác sĩ: {appointmentDetails.doctor.fullName}
                  <br />
                  Chuyên khoa: {appointmentDetails.specialty.name}
                  <br />
                  Ngày: {appointmentDetails.booking.date}
                  <br />
                  Giờ hẹn: {appointmentDetails.booking.slot}
                </Typography>
              )}
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  variant="outlined"
                  onClick={() => {
                    navigate(paths.dashboard.root)
                    localStorage.removeItem('currentCase')
                  }}
                >
                  Về trang chính
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate(paths.dashboard.appointment.list)
                    localStorage.removeItem('currentCase')
                  }}
                >
                  Xem danh sách lịch hẹn
                </Button>
              </div>
            </>
          )
        }
        return null
      })()}
    </Container>
  )
}

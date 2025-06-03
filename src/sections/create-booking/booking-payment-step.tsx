import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'

import { Button, useTheme, TextField, useMediaQuery } from '@mui/material'

import PaymentMethods from '../payment/payment-methods'
import { createPaymentURL, createAppointment } from './api'

export default function BookingPayment({
  setCurrentStep,
  specialty,
  formData,
  handleSubmit
}: {
  setCurrentStep: any
  specialty: any
  formData: any
  handleSubmit: any
}) {
  console.log('formData', formData)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const { enqueueSnackbar } = useSnackbar()
  const data2 = localStorage.getItem('booking_form_data_2')
  const data1 = localStorage.getItem('booking_form_data_1')
  const parsedData2 = JSON.parse(data2 || '{}')
  const parsedData1 = JSON.parse(data1 || '{}')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const booking = {
    ...parsedData2,
    ...parsedData1
  }

  const doctorFee = booking?.doctor?.rank?.base_price || 0
  const totalFee = doctorFee
  const [coupon, setCoupon] = useState<string>('')
  const [discount, setDiscount] = useState<number>(0)
  const [generalSettings, setGeneralSettings] = useState<any>(null)
  useEffect(() => {
    setGeneralSettings(
      JSON.parse(localStorage.getItem('generalSettings') || '{}')
    )
  }, [])
  console.log(generalSettings)
  const handleApplyCoupon = () => {
    const validCoupons = generalSettings?.general_setting?.COUPON_CODE

    const matchedCoupon = validCoupons.find((item: any) => item.name === coupon)

    if (matchedCoupon) {
      // Nếu là mã giảm giá đặc biệt (FREE), giảm toàn bộ tiền
      if (matchedCoupon.type === 'FREE') {
        setDiscount(totalFee)
        enqueueSnackbar('Áp dụng mã giảm giá miễn phí thành công', {
          variant: 'success'
        })
      } else {
        // Giảm giá thông thường
        setDiscount(matchedCoupon.value)
        enqueueSnackbar('Áp dụng mã giảm giá thành công', {
          variant: 'success'
        })
      }
    } else {
      setDiscount(0)
      enqueueSnackbar('Mã giảm giá không hợp lệ', {
        variant: 'error'
      })
    }
  }
  const finalTotalFee = totalFee - discount

  const handleSubmitConfirm = async () => {
    try {
      if (!paymentMethod) {
        enqueueSnackbar('Vui lòng chọn phương thức thanh toán', {
          variant: 'warning'
        })
        return
      }
      const paymentPayload = {
        paymentMethod,
        total: finalTotalFee,
        platformFee: generalSettings?.general_setting?.PLATFORM_FEE,
        doctorFee,
        discount
      }
      const appointmentPayload = {
        ...formData,
        doctor: booking.doctor,
        date: booking.date,
        slot: booking.slot,
        timezone: booking.timezone,
        paymentMethod,
        payment: paymentPayload
      }
      // Nếu WALLET
      if (paymentMethod === 'WALLET') {
        const res = await createAppointment(appointmentPayload)
        if (res?.payment?.status === 'PAID') {
          enqueueSnackbar('Thanh toán thành công bằng ví!', {
            variant: 'success'
          })
          setCurrentStep('payment-completed')
        } else {
          enqueueSnackbar('Có lỗi khi thanh toán bằng ví!', {
            variant: 'error'
          })
        }
      }
      // Nếu VNPAY
      else if (paymentMethod === 'VNPAY') {
        const res = await createPaymentURL({
          patient: formData?.patient,
          amount: finalTotalFee,
          appointmentId: formData.appointmentId
        })
        if (res?.paymentUrl) {
          window.location.href = res.paymentUrl
        } else {
          enqueueSnackbar('Không lấy được link thanh toán VNPAY', {
            variant: 'error'
          })
        }
      }
    } catch (err: any) {
      if (err?.response?.data?.message?.includes('số dư')) {
        enqueueSnackbar('Số dư ví không đủ!', { variant: 'error' })
      } else {
        enqueueSnackbar('Có lỗi khi tạo lịch hẹn', { variant: 'error' })
      }
    }
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 py-${isMobile ? '4' : '10'}`}>
      <h2
        className={`text-${isMobile ? 'xl' : '2xl'} font-bold text-gray-800 mb-${
          isMobile ? '4' : '6'
        } text-center`}
      >
        Xác nhận thông tin lịch hẹn
      </h2>
      <div
        className={`grid grid-cols-1 ${isTablet ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-${
          isMobile ? '4' : '10'
        } items-start bg-white shadow rounded-lg p-${isMobile ? '4' : '6'}`}
      >
        {/* Left Section */}
        <div className="flex flex-col gap-4">
          <div className="bg-amber border border-gray-200 rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-500">
              Mã lịch hẹn:{' '}
              <strong className="text-gray-800">
                {formData.appointmentId}
              </strong>
            </p>

            <div
              className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 items-${
                isMobile ? 'start' : 'center'
              }`}
            >
              <img
                src={
                  booking.doctor?.avatarUrl ||
                  'https://www.shutterstock.com/image-vector/default-placeholder-doctor-halflength-portrait-600nw-1058724875.jpg'
                }
                alt={booking.doctor?.fullName}
                className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-full object-cover`}
              />
              <div>
                <p className={`text-${isMobile ? 'base' : 'lg'} font-semibold`}>
                  {booking.doctor?.fullName}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.doctor?.hospital.name} -{' '}
                  {specialty?.name || 'Chuyên khoa chưa chọn'}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-700 mt-4">
              <p>
                <strong>Ngày hẹn:</strong> {booking.date}
              </p>
              <p>
                <strong>Khung giờ:</strong> {booking.slot} giờ
              </p>
              <p>
                <strong>Múi giờ:</strong> {booking.timezone || 'GMT+7'}
              </p>
            </div>
          </div>
          <div className="bg-amber border border-gray-200 rounded-lg p-4 space-y-4">
            <h4
              className={`text-${isMobile ? 'base' : 'lg'} font-semibold text-gray-800 mb-2`}
            >
              Chi phí thanh toán
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Phí bác sĩ</span>
                <span>{doctorFee.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span>{discount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div
                className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-${
                  isMobile ? 'start' : 'center'
                } gap-2`}
              >
                <span>Mã giảm giá</span>
                <div
                  className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 items-${
                    isMobile ? 'start' : 'end'
                  } justify-end w-full`}
                >
                  <TextField
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    variant="outlined"
                    size="small"
                    fullWidth={isMobile}
                  />
                  <Button
                    variant="contained"
                    onClick={handleApplyCoupon}
                    fullWidth={isMobile}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-black">
                <span>Tổng cộng</span>
                <span>{finalTotalFee.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right Section */}
        <div
          className={`flex flex-col justify-between h-full w-full p-${
            isMobile ? '4' : '6'
          } border border-gray-200 rounded-lg bg-white shadow-sm`}
        >
          <div
            className={`flex flex-col items-center justify-center w-full ${isMobile ? 'py-4' : 'py-8'} flex-1`}
          >
            <img
              src="https://res.cloudinary.com/dut4zlbui/image/upload/v1746366836/geiw8b1qgv3w7sia9o4h.png"
              alt="TalkToDoc Logo"
              className={`mx-auto mb-4 ${isMobile ? 'h-14' : 'h-20'}`}
            />

            <PaymentMethods setPaymentMethod={setPaymentMethod} />
            <p className="text-sm text-gray-600 text-center mt-4">
              Vui lòng kiểm tra lại thanh toán và bấm tiếp tục để thanh toán.
            </p>
          </div>
          <div
            className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between mt-${
              isMobile ? '4' : '8'
            } gap-4`}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                localStorage.setItem('booking_step', 'select-time-booking')
                setCurrentStep('select-time-booking', true)
              }}
              fullWidth={isMobile}
            >
              Trở về
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitConfirm}
              fullWidth={isMobile}
            >
              Thanh toán ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

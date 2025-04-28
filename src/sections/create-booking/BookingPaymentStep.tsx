import { useState } from 'react';

import { Button, TextField } from '@mui/material';

import { createPaymentURL } from './api';

const generateAppointmentCode = () => {
  const randomSixDigits = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AP-${randomSixDigits}`;
};

export default function BookingPayment({
  setCurrentStep,
  specialty,
  formData,
  handleSubmit,
}: {
  setCurrentStep: any;
  specialty: any;
  formData: any;
  handleSubmit: any;
}) {
  const data2 = localStorage.getItem('booking_form_data_2');
  const data1 = localStorage.getItem('booking_form_data_1');
  const parsedData2 = JSON.parse(data2 || '{}');
  const parsedData1 = JSON.parse(data1 || '{}');

  const booking = {
    ...parsedData2,
    ...parsedData1,
  };

  console.log('booking', booking);
  const PLATFORM_FEE = 50000;
  const doctorFee = booking?.doctor?.rank?.base_price || 0;
  const totalFee = doctorFee;
  const [coupon, setCoupon] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('vnpay');

  const [appointmentCode] = useState(() => {
    const storedCode = localStorage.getItem('appointment_code');
    if (storedCode) return storedCode;
    const newCode = generateAppointmentCode();
    localStorage.setItem('appointment_code', newCode);
    return newCode;
  });
  const handleApplyCoupon = () => {
    if (coupon === 'DISCOUNT10') {
      setDiscount(
        10000 // Example discount
      );
    } else {
      setDiscount(0);
    }
  };
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const finalTotalFee = totalFee - discount;

  const handleSubmitConfirm = async () => {
    const updatedFormData = {
      paymentMethod,
      discount,
      totalFee: finalTotalFee,
    };
    handleSubmit({
      ...formData,
      payment: updatedFormData,
    });
    const paymentURL = await createPaymentURL({
      userId: userProfile?._id,
      amount: finalTotalFee,
    });
    localStorage.removeItem('booking_step');
    window.location.href = paymentURL?.paymentUrl;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Xác nhận thông tin lịch hẹn
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start bg-white shadow rounded-lg p-6">
        {/* Left Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-amber border border-gray-200 rounded-lg p-6 space-y-4">
            <p className="text-sm text-gray-500">
              Mã lịch hẹn: <strong className="text-gray-800">{formData.appointmentId}</strong>
            </p>

            <div className="flex gap-4 items-center">
              <img
                src={
                  booking.doctor?.avatarUrl ||
                  'https://www.shutterstock.com/image-vector/default-placeholder-doctor-halflength-portrait-600nw-1058724875.jpg'
                }
                alt={booking.doctor?.fullName}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <p className="text-lg font-semibold">{booking.doctor?.fullName}</p>
                <p className="text-sm text-gray-500">
                  {booking.doctor?.hospital.name} - {specialty?.name || 'Chuyên khoa chưa chọn'}
                </p>
                <p className="text-sm text-gray-500" />
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
          <div className="bg-amber border border-gray-200 rounded-lg p-6 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Chi phí thanh toán</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Phí bác sĩ</span>
                <span>{doctorFee.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span>{discount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mã giảm giá</span>
                <div className="flex gap-2 items-end justify-end">
                  <TextField
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    variant="outlined"
                    size="small"
                    className=""
                  />
                  <Button variant="contained" onClick={handleApplyCoupon}>
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
        <div className="flex flex-col justify-between h-full w-full p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div>
            <div className="mb-6 flex flex-col items-start justify-start">
              <img
                src="https://res.cloudinary.com/dut4zlbui/image/upload/v1741615997/tuw1thbedrzcp17iv34p.png"
                alt="TalkToDoc Logo"
                className="h-20 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">Xác nhận thanh toán</h3>
              <p className="text-sm text-gray-600">
                Vui lòng kiểm tra lại thanh toán và bấm tiếp tục để thanh toán.
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-8 gap-4">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setCurrentStep('select-time-booking', true)}
            >
              Trở về
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmitConfirm}>
              Thanh toán ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

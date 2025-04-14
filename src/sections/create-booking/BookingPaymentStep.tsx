import { useState } from 'react';
import { FaCcVisa } from 'react-icons/fa';
import { IoQrCode } from 'react-icons/io5';

import { Button, TextField } from '@mui/material';

export default function BookingPayment({
  setCurrentStep,
  specialty,
  formData,
}: {
  setCurrentStep: any;
  specialty: any;
  formData: any;
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
  const totalFee = PLATFORM_FEE + doctorFee;
  const [coupon, setCoupon] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('vnpay');

  const handleApplyCoupon = () => {
    if (coupon === 'DISCOUNT10') {
      setDiscount(
        10000 // Example discount
      );
    } else {
      setDiscount(0);
    }
  };

  const finalTotalFee = totalFee - discount;

  const paymentOptions = [
    { label: 'Thẻ Tín Dụng', value: 'credit', icon: <FaCcVisa className="text-xl" /> },
    { label: 'VNPAY', value: 'vnpay', icon: <IoQrCode className="text-xl" /> },
    {
      label: 'Momo',
      value: 'momo',
      icon: (
        <img
          src="https://brandlogos.net/wp-content/uploads/2023/09/momo-logo_brandlogos.net_mtkvq-300x300.png"
          alt="Momo"
          className="w-6 h-6"
        />
      ),
    },
  ];

  const handleSubmit = () => {
    const updatedFormData = {
      ...formData,
      paymentMethod,
      discount,
      totalFee: finalTotalFee,
    };
    // Save updated form data to local storage or send to API
    localStorage.setItem('booking_form_data', JSON.stringify(updatedFormData));
    setCurrentStep('payment-completed');
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
              Mã lịch hẹn:{' '}
              <strong className="text-gray-800">
                {Math.random().toString(36).substring(2, 15)}
              </strong>
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
                    className="w-1/2"
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
        <div className="flex flex-col justify-between h-full w-full p-6 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
          <div>
            <div className="mb-6 flex flex-col items-start justify-start">
              <img
                src="https://res.cloudinary.com/dut4zlbui/image/upload/v1741615997/tuw1thbedrzcp17iv34p.png"
                alt="TalkToDoc Logo"
                className="h-20 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">Xác nhận thanh toán</h3>
              <p className="text-sm text-gray-600">
                Vui lòng chọn phương thức thanh toán và kiểm tra thông tin lịch hẹn của bạn.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800">Phương thức thanh toán:</h3>
              <div className="flex gap-4">
                {paymentOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentMethod(option.value)}
                    className={`border rounded-lg px-4 py-3 flex items-center gap-2 shadow-sm transition-all ${
                      paymentMethod === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-300'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {option.icon}
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 gap-4">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setCurrentStep('select-time-booking')}
            >
              Quay lại
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Xác nhận & Thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

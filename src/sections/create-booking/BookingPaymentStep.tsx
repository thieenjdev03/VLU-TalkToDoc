import { Button } from '@mui/material';

export default function BookingPayment({
  setCurrentStep,
  specialty,
}: {
  setCurrentStep: any;
  specialty: any;
}) {
  const data2 = localStorage.getItem('booking_form_data_2');
  const data1 = localStorage.getItem('booking_form_data_1');
  const parsedData2 = JSON.parse(data2 || '{}');
  const parsedData1 = JSON.parse(data1 || '{}');

  const booking = {
    ...parsedData2,
    ...parsedData1,
  };

  const PLATFORM_FEE = 50000;
  const doctorFee = booking?.doctor?.rank?.base_price || 0;
  const totalFee = PLATFORM_FEE + doctorFee;
  console.log('booking', booking);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Xác nhận thông tin lịch hẹn
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start bg-white shadow rounded-lg p-6">
        {/* Left Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-500">
              Mã đơn hàng:{' '}
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
          <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Chi phí thanh toán</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Phí nền tảng</span>
                <span>{PLATFORM_FEE.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí bác sĩ</span>
                <span>{doctorFee.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-black">
                <span>Tổng cộng</span>
                <span>{totalFee.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right Section */}
        <div className="flex flex-col items-start h-full">
          <img
            src="https://res.cloudinary.com/dut4zlbui/image/upload/v1741615997/tuw1thbedrzcp17iv34p.png"
            alt="logo"
            className="h-30 mb-"
          />

          <h3 className="text-xl font-semibold text-gray-900 mb-2">Cảm ơn bạn đã đặt lịch!</h3>
          <p className="text-sm text-gray-600 mb-6">
            Lịch hẹn đã được tạo. Vui lòng kiểm tra email của bạn để biết chi tiết về cuộc hẹn.
          </p>
          <div className="flex justify-end mt-8 gap-4">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setCurrentStep('select-time-booking')}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              color="primary"
              href="https://sandbox.vnpayment.vn/paymentv2/VnMart/Transaction/Index.html?token=43aee4d33e4447429e7fd9c2d9dc353f"
              onClick={() => setCurrentStep('payment-completed')}
            >
              Xác nhận & Thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

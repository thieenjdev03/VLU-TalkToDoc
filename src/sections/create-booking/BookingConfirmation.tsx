import { Button } from '@mui/material';

export default function BookingConfirmation({ booking }: { booking: any }) {
  console.log('booking', booking);
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row justify-between items-center gap-8 px-6 py-10 bg-white">
      {/* Left */}
      <div className="flex flex-col items-start">
        <img
          src="/logo.svg" // thay bằng logo của bạn
          alt="logo"
          className="mb-4 h-10"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cảm ơn bạn đã đặt lịch hẹn!</h2>
        <p className="text-gray-600 mb-6">
          Lịch hẹn của bạn đã được đặt! Vui lòng kiểm tra email của bạn để biết thêm chi tiết
        </p>
        <Button variant="contained" color="primary" className="rounded-md">
          Đi đến Trang chủ
        </Button>
      </div>

      {/* Right */}
      <div className="w-full max-w-md bg-gray-50 p-6 rounded-xl shadow">
        <p className="text-sm text-gray-400 mb-2">
          Đơn hàng của bạn: <span className="font-semibold text-black">{booking.code}</span>
        </p>

        <div className="flex items-center gap-4 mb-4 flex-col w-full">
          <img
            src={booking.doctor?.avatarUrl || 'https://via.placeholder.com/80'}
            alt={booking.doctor?.fullName}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="w-full">
            <h3 className="text-lg font-semibold">{booking.doctor?.fullName}</h3>
            <p className="text-gray-500 text-sm">
              Ngày hẹn: {booking.date} |{booking.time} <br />
              {booking.timezone}
            </p>
          </div>

          <hr className="my-4" />
          <div className="space-y-2 text-sm w-full">
            <div className="flex justify-between">
              <span className="text-gray-600">Phí nền tảng</span>
              <span>
                {booking.subTotal?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí bác sĩ</span>
              <span>
                -{booking.discount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="flex justify-between font-bold text-black">
              <span>Tổng cộng</span>
              <span>
                {booking.total?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

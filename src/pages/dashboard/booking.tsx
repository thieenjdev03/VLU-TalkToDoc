import { Helmet } from 'react-helmet-async';

import { BookingListPage } from 'src/sections/create-booking/view/create-view';

// ----------------------------------------------------------------------

export default function OverviewBookingPage() {
  return (
    <>
      <Helmet>
        <title> Trang Chủ: Đặt Lịch Hẹn</title>
      </Helmet>

      <BookingListPage />
    </>
  );
}

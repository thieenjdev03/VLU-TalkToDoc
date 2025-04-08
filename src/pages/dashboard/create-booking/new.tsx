import { Helmet } from 'react-helmet-async';

import BookingCreate from 'src/sections/create-booking/view/create-view';
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Trang Chủ: Đặt Lịch Hẹn</title>
      </Helmet>

      <BookingCreate />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { AppointmentListView } from 'src/sections/appointment/view';
// ----------------------------------------------------------------------

export default function AppointmentListPage() {
  return (
    <>
      <Helmet>
        <title> Trang quản lý: Danh Sách Lịch Hẹn</title>
      </Helmet>

      <AppointmentListView />
    </>
  );
}

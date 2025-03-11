import { Helmet } from 'react-helmet-async';

import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserDoctorListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Danh sách Bác Sĩ</title>
      </Helmet>

      <UserListView typeUser="doctor" />
    </>
  );
}

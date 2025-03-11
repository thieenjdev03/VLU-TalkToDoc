import { Helmet } from 'react-helmet-async';

import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserPatientListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Danh sách Bệnh Nhân</title>
      </Helmet>

      <UserListView typeUser="patient" />
    </>
  );
}

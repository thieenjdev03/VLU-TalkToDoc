import { Helmet } from 'react-helmet-async';

import { UserCreateView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserCreatePage(props: {
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
}) {
  const { typeUser } = props;
  return (
    <>
      <Helmet>
        <title> Dashboard: Tạo người dùng mới</title>
      </Helmet>

      <UserCreateView typeUser={typeUser} />
    </>
  );
}

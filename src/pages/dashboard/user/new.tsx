import { Helmet } from 'react-helmet-async';

import { UserCreateView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserCreatePage(props: { typeUser: 'user' | 'doctor' | 'employee' }) {
  const { typeUser } = props;
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new user</title>
      </Helmet>

      <UserCreateView typeUser={typeUser} />
    </>
  );
}

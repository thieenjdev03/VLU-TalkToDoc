import { Helmet } from 'react-helmet-async';

import { useGetHospital } from 'src/api/hospital';

import { UserCreateView } from 'src/sections/user/view';
// ----------------------------------------------------------------------

export default function UserCreatePage(props: {
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
}) {
  const { typeUser } = props;
  const { hospitals } = useGetHospital({
    query: '',
    page: 1,
    limit: 10,
    sortField: '',
    sortOrder: 'desc',
  });
  console.log('hospitals', hospitals);
  return (
    <>
      <Helmet>
        <title> Dashboard: Tạo người dùng mới</title>
      </Helmet>

      <UserCreateView typeUser={typeUser} hospitals={hospitals?.data} />
    </>
  );
}

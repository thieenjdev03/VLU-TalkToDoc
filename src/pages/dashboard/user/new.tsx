import { Helmet } from 'react-helmet-async';

import { useGetRanking } from 'src/api/ranking';
import { useGetHospital } from 'src/api/hospital';

import { UserCreateView } from 'src/sections/user/view';
// ----------------------------------------------------------------------

export default function UserCreatePage(props: {
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
}) {
  const { typeUser } = props;
  const { hospitals } = useGetHospital();
  const { providerRanking } = useGetRanking({
    query: '',
    page: 1,
    limit: 10,
    sortField: '',
    sortOrder: 'desc',
  });
  return (
    <>
      <Helmet>
        <title> Dashboard: Tạo người dùng mới</title>
      </Helmet>

      <UserCreateView typeUser={typeUser} hospitals={hospitals} ranking={providerRanking} />
    </>
  );
}

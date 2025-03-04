import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { UserEditView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title>Trang chủ: Chỉnh sửa người dùng</title>
      </Helmet>

      <UserEditView id={`${id}`} />
    </>
  );
}

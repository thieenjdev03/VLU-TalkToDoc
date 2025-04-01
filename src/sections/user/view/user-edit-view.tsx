import { useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _userList } from 'src/_mock';
import { useGetSpecialties } from 'src/api/specialty';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../user-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function UserEditView({ id }: Props) {
  const settings = useSettingsContext();

  const currentUser = _userList.find((user) => user.id === id);
  const handleUpdateSuccess = () => {
    // window.location.reload();
  };

  useEffect(() => {}, [id]);
  const { specialties } = useGetSpecialties({
    query: '',
    page: 1,
    limit: 10,
    sortField: '',
    sortOrder: 'desc',
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Chỉnh sửa người dùng"
        links={[
          {
            name: 'Trang chủ',
            href: paths.dashboard.root,
          },
          {
            name: 'Người dùng',
            href: paths.dashboard.user.root,
          },
          { name: currentUser?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <UserNewEditForm
        currentUser={currentUser}
        typeUser={currentUser?.role as 'user' | 'doctor' | 'employee'}
        hospitals={[]}
        rank={{ data: [] }}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </Container>
  );
}

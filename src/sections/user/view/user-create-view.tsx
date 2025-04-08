import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IHospitalItem } from 'src/types/hospital';

import UserNewEditForm from '../user-new-edit-form';

// ----------------------------------------------------------------------

export default function UserCreateView(props: {
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
  hospitals: IHospitalItem[];
}) {
  const { typeUser, hospitals } = props;
  const settings = useSettingsContext();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={`Tạo người dùng ${
          {
            doctor: 'Bác Sĩ',
            employee: 'Nhân Viên',
            user: 'Người Dùng',
            patient: 'Bệnh Nhân',
          }[typeUser]
        }`}
        links={[
          {
            name: 'Trang chủ',
            href: paths.dashboard.root,
          },
          {
            name: 'Người dùng',
            href: paths.dashboard.user.root,
          },
          { name: 'Tạo Mới' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <UserNewEditForm typeUser={typeUser} hospitals={hospitals} />
    </Container>
  );
}

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import RankingNewEditForm from '../new-edit-form';

// ----------------------------------------------------------------------

export default function RankingCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Tạo chuyên khoa mới"
        links={[
          {
            name: 'Quản Lý Chuyên Khoa',
            href: paths.dashboard.specialties.root,
          },
          { name: 'Tạo Mới' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <RankingNewEditForm />
    </Container>
  );
}

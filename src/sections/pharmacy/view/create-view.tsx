import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PharmacyNewEditForm from '../new-edit-form';

// ----------------------------------------------------------------------

export default function PharmacyCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Tạo nhà thuốc mới"
        links={[
          {
            name: 'Quản lý nhà thuốc',
            href: paths.dashboard.pharmacies.list,
          },
          { name: 'Tạo Mới' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <PharmacyNewEditForm />
    </Container>
  );
}

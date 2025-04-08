import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import BookingCreate from '../booking-create';

// ----------------------------------------------------------------------

export default function BookingCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Tạo lịch hẹn mới"
        links={[
          {
            name: 'Quản Lý Lịch Hẹn',
            href: paths.dashboard.booking.root,
          },
          { name: 'Tạo Mới' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <BookingCreate />
    </Container>
  );
}

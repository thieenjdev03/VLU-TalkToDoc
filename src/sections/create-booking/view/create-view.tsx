import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { getFormConfigById } from 'src/api/auth';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import BookingCreate from '../booking-create';
// ----------------------------------------------------------------------

export default function BookingCreateView() {
  const settings = useSettingsContext();
  const [generalSettings, setGeneralSettings] = useState<any>(null);
  useEffect(() => {
    const getFormConfig = async () => {
      const formConfig = await getFormConfigById('6800dd76b0ca284dcc67cde4');
      const parsedSetting = typeof formConfig === 'string' ? JSON.parse(formConfig) : formConfig;

      setGeneralSettings(parsedSetting?.general_setting);
      localStorage.setItem('generalSettings', parsedSetting?.general_setting);
    };
    getFormConfig();
  }, []);
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

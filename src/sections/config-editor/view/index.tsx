import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import JsonConfigEditor from '../config-editor';

// ----------------------------------------------------------------------

export default function ConfigEditorView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Cấu hình"
        links={[
          {
            name: 'Cấu hình',
            href: paths.dashboard.config.root,
          },
          { name: 'Cấu hình' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <JsonConfigEditor />
    </Container>
  );
}

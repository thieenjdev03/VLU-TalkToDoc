import Card from '@mui/material/Card'
import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

export default function RevenueTTDView() {
  const settings = useSettingsContext()
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Báo cáo doanh thu TalkToDoc"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Báo cáo', href: paths.dashboard.report.root },
          { name: 'Doanh thu TalkToDoc' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        {/* Nội dung báo cáo doanh thu TalkToDoc ở đây */}
        <div>Chức năng báo cáo doanh thu TalkToDoc (placeholder)</div>
      </Card>
    </Container>
  )
}

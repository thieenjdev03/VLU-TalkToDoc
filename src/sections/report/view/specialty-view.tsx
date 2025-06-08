import Card from '@mui/material/Card'
import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

export default function SpecialtyReportView() {
  const settings = useSettingsContext()
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Báo cáo chuyên khoa"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Báo cáo', href: paths.dashboard.report.root },
          { name: 'Chuyên khoa' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        {/* Nội dung báo cáo chuyên khoa ở đây */}
        <div>Chức năng báo cáo chuyên khoa (placeholder)</div>
      </Card>
    </Container>
  )
}

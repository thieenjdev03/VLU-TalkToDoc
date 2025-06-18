import { Helmet } from 'react-helmet-async'

import { OverviewAnalyticsView } from 'src/sections/overview/analytics/view'

// ----------------------------------------------------------------------

export default function OverviewAnalyticsPage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Analytics</title>
      </Helmet>

      <OverviewAnalyticsView />
    </>
  )
}

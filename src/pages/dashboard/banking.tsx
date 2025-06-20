import { Helmet } from 'react-helmet-async'

import { OverviewBankingView } from 'src/sections/overview/banking/view'

// ----------------------------------------------------------------------

export default function OverviewBankingPage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Banking</title>
      </Helmet>

      <OverviewBankingView />
    </>
  )
}

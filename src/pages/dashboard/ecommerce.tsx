import { Helmet } from 'react-helmet-async'

import { OverviewEcommerceView } from 'src/sections/overview/e-commerce/view'

// ----------------------------------------------------------------------

export default function OverviewEcommercePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: E-Commerce</title>
      </Helmet>

      <OverviewEcommerceView />
    </>
  )
}

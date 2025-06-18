import { Helmet } from 'react-helmet-async'

import { InvoiceCreateView } from 'src/sections/invoice/view'

// ----------------------------------------------------------------------

export default function InvoiceCreatePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Create a new invoice</title>
      </Helmet>

      <InvoiceCreateView />
    </>
  )
}

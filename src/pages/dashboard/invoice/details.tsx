import { Helmet } from 'react-helmet-async'

import { useParams } from 'src/routes/hooks'

import { InvoiceDetailsView } from 'src/sections/invoice/view'

// ----------------------------------------------------------------------

export default function InvoiceDetailsPage() {
  const params = useParams()

  const { id } = params

  return (
    <>
      <Helmet>
        <title> Trang quản trị: Invoice Details</title>
      </Helmet>

      <InvoiceDetailsView id={`${id}`} />
    </>
  )
}

import { Helmet } from 'react-helmet-async'

import { useParams } from 'src/routes/hooks'

import { ProductDetailsView } from 'src/sections/product/view'

// ----------------------------------------------------------------------

export default function ProductDetailsPage() {
  const params = useParams()

  const { id } = params

  return (
    <>
      <Helmet>
        <title> Trang quản trị: Product Details</title>
      </Helmet>

      <ProductDetailsView id={`${id}`} />
    </>
  )
}

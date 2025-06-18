import { Helmet } from 'react-helmet-async'

import { OrderListView } from 'src/sections/order/view'

// ----------------------------------------------------------------------

export default function OrderListPage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Order List</title>
      </Helmet>

      <OrderListView />
    </>
  )
}

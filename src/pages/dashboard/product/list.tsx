import { Helmet } from 'react-helmet-async';

import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function ProductListPage() {
  return (
    <>
      <Helmet>
        <title> Trang Chủ : Quản Lý Thuốc</title>
      </Helmet>

      <ProductListView />
    </>
  );
}

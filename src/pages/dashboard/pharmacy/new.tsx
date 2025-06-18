import { Helmet } from 'react-helmet-async'

import SpecialtyCreateView from 'src/sections/pharmacy/view/create-view'
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Tạo nhà thuốc mới</title>
      </Helmet>

      <SpecialtyCreateView />
    </>
  )
}

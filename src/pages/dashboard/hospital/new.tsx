import { Helmet } from 'react-helmet-async'

import SpecialtyCreateView from 'src/sections/hospital/view/create-view'
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Tạo Bệnh Viện mới</title>
      </Helmet>

      <SpecialtyCreateView />
    </>
  )
}

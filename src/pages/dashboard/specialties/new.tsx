import { Helmet } from 'react-helmet-async'

import SpecialtyCreateView from 'src/sections/specialty/view/create-view'
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Tạo chuyên khoa mới</title>
      </Helmet>

      <SpecialtyCreateView />
    </>
  )
}

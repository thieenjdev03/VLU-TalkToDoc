import { Helmet } from 'react-helmet-async'

import { CaseListView } from 'src/sections/case/view'

// ----------------------------------------------------------------------

export default function CaseListPage() {
  return (
    <>
      <Helmet>
        <title> Trang Quản Trị : danh sách bệnh án </title>
      </Helmet>

      <CaseListView />
    </>
  )
}

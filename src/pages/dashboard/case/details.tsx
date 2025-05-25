import { Helmet } from 'react-helmet-async'

import { useParams } from 'src/routes/hooks'

import CaseDetailsView from 'src/sections/case/view/case-details-view'

// ----------------------------------------------------------------------

export default function CaseDetailsPage() {
  const params = useParams()

  const { id } = params

  if (!id) {
    return <div>Không tìm thấy ID</div>
  }

  return (
    <>
      <Helmet>
        <title> Trang Quản Trị: Chi Tiết Bệnh Án</title>
      </Helmet>

      <CaseDetailsView
        id={`${id}`}
        taxes={0}
        shipping={0}
        discount={0}
        subTotal={0}
        totalAmount={0}
        items={[]}
      />
    </>
  )
}

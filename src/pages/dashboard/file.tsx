import { Helmet } from 'react-helmet-async'

import { OverviewFileView } from 'src/sections/overview/file/view'

// ----------------------------------------------------------------------

export default function OverviewFilePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: File</title>
      </Helmet>

      <OverviewFileView />
    </>
  )
}

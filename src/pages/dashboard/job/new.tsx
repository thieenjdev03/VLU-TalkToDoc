import { Helmet } from 'react-helmet-async'

import { JobCreateView } from 'src/sections/job/view'

// ----------------------------------------------------------------------

export default function JobCreatePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Create a new job</title>
      </Helmet>

      <JobCreateView />
    </>
  )
}

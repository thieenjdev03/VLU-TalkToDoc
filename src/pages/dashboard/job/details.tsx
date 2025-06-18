import { Helmet } from 'react-helmet-async'

import { useParams } from 'src/routes/hooks'

import { JobDetailsView } from 'src/sections/job/view'

// ----------------------------------------------------------------------

export default function JobDetailsPage() {
  const params = useParams()

  const { id } = params

  return (
    <>
      <Helmet>
        <title> Trang quản trị: Job Details</title>
      </Helmet>

      <JobDetailsView id={`${id}`} />
    </>
  )
}

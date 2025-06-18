import { Helmet } from 'react-helmet-async'

import { TourCreateView } from 'src/sections/tour/view'

// ----------------------------------------------------------------------

export default function TourCreatePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Create a new tour</title>
      </Helmet>

      <TourCreateView />
    </>
  )
}

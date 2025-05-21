import { Helmet } from 'react-helmet-async'

import { AboutView } from 'src/sections/about/view'

// ----------------------------------------------------------------------

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title> Về chúng tôi</title>
      </Helmet>

      <AboutView />
    </>
  )
}

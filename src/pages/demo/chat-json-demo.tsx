import { Helmet } from 'react-helmet-async'

import { ChatJsonDemo } from 'src/sections/chat/chat-json-demo'

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Chat JSON API Demo | TalkToDoc</title>
      </Helmet>

      <ChatJsonDemo />
    </>
  )
}

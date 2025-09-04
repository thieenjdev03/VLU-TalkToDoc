import { Helmet } from 'react-helmet-async'

import { Container } from '@mui/material'

import ChatKeywordDemo from 'src/sections/chat/chat-keyword-demo'

// ----------------------------------------------------------------------

export default function ChatKeywordDemoPage() {
  return (
    <>
      <Helmet>
        <title>Demo: Chat Keyword Detection</title>
      </Helmet>

      <Container maxWidth="xl">
        <ChatKeywordDemo />
      </Container>
    </>
  )
}

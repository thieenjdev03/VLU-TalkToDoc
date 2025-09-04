import { Helmet } from 'react-helmet-async'

import { Container } from '@mui/material'

import ChatSidebarDemo from 'src/sections/chat/chat-sidebar-demo'

// ----------------------------------------------------------------------

export default function ChatSidebarDemoPage() {
  return (
    <>
      <Helmet>
        <title>Demo: Chat Conversation Sidebar</title>
      </Helmet>

      <Container maxWidth="xl">
        <ChatSidebarDemo />
      </Container>
    </>
  )
}

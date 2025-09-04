import { Helmet } from 'react-helmet-async'

import { Container } from '@mui/material'

import ChatAppointmentDemo from 'src/sections/chat/chat-appointment-demo'

// ----------------------------------------------------------------------

export default function ChatAppointmentDemoPage() {
  return (
    <>
      <Helmet>
        <title>Demo: Chat Appointment Suggestion</title>
      </Helmet>

      <Container maxWidth="lg">
        <ChatAppointmentDemo />
      </Container>
    </>
  )
}

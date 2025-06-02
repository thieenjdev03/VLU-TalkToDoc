import { useMemo } from 'react'

import { Box, Stack, Avatar } from '@mui/material'

import Scrollbar from 'src/components/scrollbar'

import { IChatMessage } from 'src/types/chat'

import ChatMessageItem from './chat-message-item'

// ----------------------------------------------------------------------

interface Props {
  messages: IChatMessage[]
  userProfile: any
  isBotReplying?: boolean
}

export function BotTypingIndicator() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
      <Avatar
        src="https://res.cloudinary.com/dut4zlbui/image/upload/v1747243574/talktodoc/owwf4irzl8hu1dm2e3ux.png"
        alt="TalkToDoc A.I"
        sx={{ width: 36, height: 36 }}
      />
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'background.neutral',
          borderRadius: 2,
          maxWidth: 320,
          minHeight: 32,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Dot />
          <Dot delay={0.2} />
          <Dot delay={0.4} />
        </Box>
      </Box>
    </Stack>
  )
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: 'text.secondary',
        animation: 'botTypingBlink 1.2s infinite',
        animationDelay: `${delay}s`,
        '@keyframes botTypingBlink': {
          '0%, 80%, 100%': { opacity: 0.2 },
          '40%': { opacity: 1 }
        }
      }}
    />
  )
}

export default function ChatMessageList({
  messages,
  userProfile,
  isBotReplying
}: Props) {
  const showBotTyping = useMemo(() => {
    if (typeof isBotReplying === 'boolean') return isBotReplying
    if (!messages || messages.length === 0) return false
    return messages[messages.length - 1].role === 'user'
  }, [messages, isBotReplying])

  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 2 }}>
      <Scrollbar sx={{ height: 1 }}>
        <Stack spacing={2} sx={{ py: 3, minHeight: 1 }}>
          {messages.map(message => (
            <ChatMessageItem
              key={message._id}
              message={message}
              isCurrentUser={message.role === 'user'}
              userProfile={userProfile}
            />
          ))}
        </Stack>
      </Scrollbar>
    </Box>
  )
}

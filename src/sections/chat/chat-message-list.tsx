import { Box, Stack } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';

import { IChatMessage } from 'src/types/chat';

import ChatMessageItem from './chat-message-item';

// ----------------------------------------------------------------------

interface Props {
  messages: IChatMessage[];
  userProfile: any;
}

export default function ChatMessageList({ messages, userProfile }: Props) {
  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 2 }}>
      <Scrollbar sx={{ height: 1 }}>
        <Stack spacing={2} sx={{ py: 3, minHeight: 1 }}>
          {messages.map((message) => (
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
  );
}

import { Box, Stack, Avatar, Typography } from '@mui/material';

import { IChatMessage } from 'src/types/chat';

interface Props {
  message: IChatMessage;
  isCurrentUser: boolean;
  userProfile: any;
}

export default function ChatMessageItem({ message, isCurrentUser, userProfile }: Props) {
  return (
    <Stack
      direction="row"
      justifyContent={isCurrentUser ? 'flex-end' : 'flex-start'}
      alignItems="flex-start"
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      {!isCurrentUser && (
        <Avatar
          src="https://res.cloudinary.com/dut4zlbui/image/upload/v1741543982/favicon-doctor.png"
          alt="TalkToDoc A.I"
          sx={{ width: 36, height: 36 }}
        />
      )}

      <Box maxWidth="70%">
        {!isCurrentUser && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
            TalkToDoc A.I
          </Typography>
        )}

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: isCurrentUser ? 'primary.main' : '#e5f0fc',
            color: isCurrentUser ? '#fff' : '#000',
            wordBreak: 'break-word',
            fontSize: 14,
            fontWeight: 400,
            boxShadow: 1,
          }}
        >
          {message.content}
        </Box>
      </Box>

      {isCurrentUser && (
        <Avatar
          src={userProfile?.avatarUrl || '/assets/images/avatar/avatar_default.jpg'}
          alt="You"
          sx={{ width: 36, height: 36 }}
        />
      )}
    </Stack>
  );
}

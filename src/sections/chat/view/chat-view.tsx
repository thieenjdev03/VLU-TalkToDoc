import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { createChat, useGetChat, sendMessageToAI } from 'src/api/chat';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import ChatMessageList from '../chat-message-list';
import ChatMessageInput from '../chat-message-input';
import ChatHeaderDetail from '../chat-header-detail';
import { useChatHistory } from '../hooks/use-chat-history';

// ----------------------------------------------------------------------

export default function ChatView() {
  const router = useRouter();
  const { user } = useMockedUser();
  const settings = useSettingsContext();
  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { conversationError } = useGetChat(selectedConversationId);
  const { messages, addMessages, clearHistory } = useChatHistory(selectedConversationId);

  useEffect(() => {
    if (conversationError || !selectedConversationId) {
      router.push(paths.dashboard.chat);
    }
  }, [conversationError, router, selectedConversationId]);

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!selectedConversationId) {
        // Create new chat if no conversation selected
        const newChat = await createChat(user?.id || '');
        router.push(`${paths.dashboard.chat}?id=${newChat._id}`);
      }

      const response = await sendMessageToAI(selectedConversationId, message, user?.id || '');

      addMessages(response.messages);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72, backgroundColor: 'primary.main' }}
    >
      <ChatHeaderDetail />

      <Stack flexGrow={1} />

      <IconButton onClick={clearHistory} color="error">
        <Iconify icon="solar:trash-bin-trash-bold" />
      </IconButton>
    </Stack>
  );

  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Stack alignItems="center" sx={{ py: 2 }}>
          <CircularProgress />
        </Stack>
      )}

      <ChatMessageList messages={messages} userProfile={user} />

      <ChatMessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Chat với AI
      </Typography>

      <Stack component={Card} sx={{ height: '72vh' }}>
        {renderHead}

        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: 'hidden',
            borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >
          {renderMessages}
        </Stack>
      </Stack>
    </Container>
  );
}

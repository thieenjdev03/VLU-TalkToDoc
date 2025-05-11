import { useState, ChangeEvent } from 'react';

import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import { Paper, InputBase, IconButton } from '@mui/material';

interface Props {
  onSendMessage: (message: string) => void;
  onUploadImage?: (file: File) => void;
  disabled?: boolean;
}

export default function ChatMessageInput({ onSendMessage, onUploadImage, disabled }: Props) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '32px',
        m: 2,
      }}
    >
      <IconButton component="label" disabled={disabled}>
        <ImageIcon />
        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
      </IconButton>

      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Nhập tin nhắn..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyUp={handleKeyUp}
        disabled={disabled}
      />

      <IconButton color="primary" onClick={handleSend} disabled={!message.trim() || disabled}>
        <SendIcon />
      </IconButton>
    </Paper>
  );
}

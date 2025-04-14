import AceEditor from 'react-ace';
import React, { useState } from 'react';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

import { Stack, Alert, Paper, Button, Container, Typography } from '@mui/material';

export default function JsonConfigEditor() {
  const [jsonText, setJsonText] = useState('{}');
  const [error, setError] = useState<string | null>(null);

  const handleLoadExample = () => {
    const example = {
      siteName: 'TalkToDoc',
      primaryColor: '#078DEE',
      maintenance: false,
      features: {
        appointment: true,
        chat: true,
        videoCall: true,
      },
    };
    setJsonText(JSON.stringify(example, null, 2));
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      localStorage.setItem('site_config', JSON.stringify(parsed));
      setError(null);
      alert('Đã lưu cấu hình thành công!');
    } catch (err: any) {
      setError(`JSON không hợp lệ: ${err.message}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" mb={3}>
          Chỉnh sửa cấu hình hệ thống (JSON)
        </Typography>

        <Stack direction="row" spacing={2} mb={2}>
          <Button variant="outlined" onClick={handleLoadExample}>
            Tải ví dụ
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Lưu cấu hình
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <AceEditor
          mode="json"
          theme="github"
          value={jsonText}
          onChange={(value) => setJsonText(value)}
          name="json-editor"
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="400px"
          fontSize={14}
          setOptions={{ useWorker: false }}
        />
      </Paper>
    </Container>
  );
}

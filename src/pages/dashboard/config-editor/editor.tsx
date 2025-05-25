import axios from 'axios';
import AceEditor from 'react-ace';
import { useSnackbar } from 'notistack';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import React, { useState, useEffect } from 'react'; // 👈 thêm
import { Stack, Alert, Paper, Button, Container, Typography } from '@mui/material';

import { API_URL } from 'src/config-global';

const FORM_ID = '6800dd76b0ca284dcc67cde4';
const API_URL_BASE = `${API_URL}/form-config/${FORM_ID}`;

export default function JsonConfigEditor() {
  const [jsonText, setJsonText] = useState('{}');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar(); // 👈 thêm
  // Load từ API khi mount
  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL_BASE)
      .then((res) => {
        const setting = res.data?.general_setting || {};
        setJsonText(JSON.stringify(setting, null, 2));
      })
      .catch((err) => {
        setError(`Lỗi khi tải cấu hình: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);
  const handleSave = async () => {
    try {
      JSON.parse(jsonText);

      await axios.put(API_URL, {
        form_json: jsonText,
      });

      enqueueSnackbar('Đã cập nhật cấu hình chức năng thành công!', { variant: 'success' }); // 👈 dùng snackbar
      setError(null);
    } catch (err: any) {
      setError(`Lỗi JSON không hợp lệ hoặc gọi API thất bại: ${err.message}`);
      enqueueSnackbar(`Cập nhật thất bại: ${err.message}`, { variant: 'error' }); // 👈 lỗi cũng dùng snackbar
    }
  };
  return (
    <Container maxWidth="xl" sx={{ py: 2, px: 1, minHeight: '70vh' }}>
      <Paper
        elevation={3}
        sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="h4" mb={1}>
          Chỉnh sửa cấu hình hệ thống (JSON)
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography style={{ fontSize: '14px', color: 'gray', fontStyle: 'normal' }}>
          Cấu hình chức năng Id : {FORM_ID}
        </Typography>
        <AceEditor
          mode="json"
          theme="monokai"
          value={jsonText}
          onChange={(value) => setJsonText(value)}
          name="json-editor"
          editorProps={{ $blockScrolling: true }}
          width="100%"
          height="400px"
          fontSize={14}
          setOptions={{ useWorker: false }}
        />
        <Stack direction="row" spacing={2} mb={2} justifyContent="flex-end">
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

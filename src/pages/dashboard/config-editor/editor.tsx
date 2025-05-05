import axios from 'axios';
import AceEditor from 'react-ace';
import { useSnackbar } from 'notistack';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Stack,
  Alert,
  Paper,
  Button,
  Container,
  Typography,
  CircularProgress,
} from '@mui/material';

import { API_URL } from 'src/config-global';

const FORM_ID = '6800dd76b0ca284dcc67cde4';
const API_URL_BASE = `${API_URL}/api/v1/form-config/${FORM_ID}`;

export default function JsonConfigEditor() {
  const [jsonText, setJsonText] = useState('{}');
  const [originalJson, setOriginalJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL_BASE)
      .then((res) => {
        const settingStr = res.data?.general_setting || '{}';
        const parsedSetting = typeof settingStr === 'string' ? JSON.parse(settingStr) : settingStr;

        const pretty = JSON.stringify(parsedSetting, null, 2);
        setJsonText(pretty);
        setOriginalJson(pretty);
      })
      .catch((err) => {
        setError(`Lỗi khi tải cấu hình: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(jsonText); // Check valid
      await axios.put(API_URL_BASE, {
        general_setting: JSON.stringify(parsed), // Gửi string
      });

      enqueueSnackbar('Đã cập nhật cấu hình thành công!', { variant: 'success' });
      setOriginalJson(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(`Lỗi JSON không hợp lệ hoặc gọi API thất bại: ${err.message}`);
      enqueueSnackbar(`Cập nhật thất bại: ${err.message}`, { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: 1, minHeight: '70vh' }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4">Chỉnh sửa cấu hình hệ thống (JSON)</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary">
          Cấu hình chức năng ID: <strong>{FORM_ID}</strong>
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <AceEditor
            mode="json"
            theme="monokai"
            value={jsonText}
            onChange={(val) => setJsonText(val)}
            name="json-editor"
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="400px"
            fontSize={14}
            setOptions={{ useWorker: false }}
          />
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || jsonText === originalJson}
          >
            {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

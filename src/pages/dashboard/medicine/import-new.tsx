import Papa from 'papaparse';
import React, { useState } from 'react';

import {
  Box,
  Table,
  Paper,
  Button,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

export default function PreviewImportMedicine(props: any) {
  const { onUpload } = props;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data.map((r: any) => ({
            id: r.ID,
            name: r.Name,
            quantity: r.Quanitty,
            frequency: r.Frequency,
            refill: r.Refill,
            finalCost: r['Final Cost'],
            feeCost: r['Fee Cost'],
            prescriptionFee: r['Prescription Fee'],
          }));
          setCsvData(parsed);
        },
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/v1/medicines/import', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Import lỗi');
      const result = await res.json();
      setImportResult(result);
      onUpload?.(result);
      enqueueSnackbar('Import thành công!', { variant: 'success' });
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Import thất bại.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    window.open('/sample-template.csv');
  };
  return (
    <Paper sx={{ p: 4, borderRadius: 2, width: '100%', height: '100vh', boxShadow: 3 }}>
      <CustomBreadcrumbs
        heading="Import Thuốc từ File CSV"
        links={[
          { name: 'Quản Lý Thuốc', href: paths.dashboard.medicine.list },
          { name: 'Import CSV' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box
        sx={{
          border: '2px dashed #d1d5db',
          borderRadius: 2,
          p: 5,
          mt: 2,
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#f3f4f6',
            borderColor: '#60a5fa',
          },
        }}
        onClick={() => document.getElementById('csv-file-input')?.click()}
      >
        <i className="fa-solid fa-cloud-arrow-up fa-2xl text-gray-500 mb-3" />
        <Typography fontSize={15} color="text.secondary">
          <strong className="text-blue-600">Nhấn hoặc kéo thả</strong> để chọn file CSV
        </Typography>
        <Typography fontSize={13} mt={1} color="gray">
          Chấp nhận định dạng <code>.csv</code> và <code>.xlsx</code>
        </Typography>

        <input
          id="csv-file-input"
          type="file"
          accept=".csv, .xlsx"
          hidden
          onChange={handleFileChange}
        />
      </Box>

      {selectedFile && (
        <Box mt={2} display="flex" alignItems="center" justifyContent="center" gap={1}>
          <i className="fa-solid fa-file-csv text-green-600" />
          <Typography>{selectedFile.name}</Typography>
        </Box>
      )}

      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary" mb={1}>
          Nếu bạn chưa có file, có thể tải mẫu dưới đây:
        </Typography>
        <Button
          onClick={handleDownloadSample}
          variant="outlined"
          color="success"
          startIcon={<i className="fa-solid fa-file-arrow-down" />}
        >
          Tải mẫu CSV
        </Button>
      </Box>
      {importResult && (
        <Box mt={4}>
          <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom>
            ✅ Kết quả Import
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              fontSize: 14,
              backgroundColor: '#f9fafb',
              borderRadius: 2,
              p: 2,
              mt: 1,
            }}
          >
            <div>
              <strong>Tổng dòng:</strong> {importResult.total}
            </div>
            <div>
              <strong>Đã xử lý:</strong> {importResult.processed}
            </div>
            <div>
              <strong>Đã tạo mới:</strong> {importResult.created}
            </div>
            <div>
              <strong>Đã cập nhật:</strong> {importResult.updated}
            </div>
            <div>
              <strong>Trùng trong file:</strong> {importResult.duplicateInBatch}
            </div>
            <div>
              <strong>Đã tồn tại:</strong> {importResult.alreadyExists}
            </div>
            <div>
              <strong className="text-red-500">Lỗi:</strong>{' '}
              <span style={{ color: importResult.failed > 0 ? 'red' : 'green' }}>
                {importResult.failed}
              </span>
            </div>
            {importResult.taskId && (
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Mã tác vụ:</strong> <span>{importResult.taskId}</span>
              </div>
            )}
          </Box>
        </Box>
      )}
      {csvData.length > 0 && (
        <Box mt={4}>
          <Typography fontWeight={600} color="primary" mb={2}>
            Kiểm tra {csvData.length} dòng thuốc
          </Typography>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Tên thuốc</TableCell>
                <TableCell>SL</TableCell>
                <TableCell>Tần suất</TableCell>
                <TableCell>Refill</TableCell>
                <TableCell>Giá cuối</TableCell>
                <TableCell>Phí</TableCell>
                <TableCell>Phí kê đơn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {csvData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.frequency}</TableCell>
                  <TableCell>{row.refill}</TableCell>
                  <TableCell>{row.finalCost}</TableCell>
                  <TableCell>{row.feeCost}</TableCell>
                  <TableCell>{row.prescriptionFee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      <Box mt={4} display="flex" justifyContent="center" gap={2}>
        <Button onClick={handleUpload} variant="contained" disabled={!selectedFile || loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận'}
        </Button>
      </Box>
    </Paper>
  );
}

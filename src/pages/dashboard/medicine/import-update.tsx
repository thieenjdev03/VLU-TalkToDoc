import React, { useState } from 'react';
import { useCSVReader } from 'react-papaparse';

import {
  Table,
  Button,
  Dialog,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { API_URL } from 'src/config-global';

import { useSnackbar } from 'src/components/snackbar';

export default function PreviewImportMedicine() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { CSVReader } = useCSVReader();

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setLoading(true);
      const URL = `${API_URL}/api/v1/medicines/import`;
      const res = await fetch(URL, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      console.log('Import result:', result);

      if (!res.ok) throw new Error('Import lỗi');

      enqueueSnackbar(
        `Import hoàn tất: ${result.success.count} mới, ${result.updated.count} cập nhật, ${result.failed.count} lỗi, ${result.duplicates.count} trùng lặp.`,
        { variant: 'success' }
      );

      setCsvData([]);
      setSelectedFile(null);
      setShowPreview(false);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Import thất bại.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setCsvData([]);
    setSelectedFile(null);
    setShowPreview(false);
  };

  const convertEuroToVND = (euroPrice: string | number, rate = 27000): number => {
    // Bỏ ký hiệu €, dấu phẩy, khoảng trắng và parse số
    const cleaned =
      typeof euroPrice === 'string' ? euroPrice.replace(/[€,\s]/g, '').trim() : euroPrice;

    const parsed = parseFloat(cleaned as string);
    if (Number.isNaN(parsed)) return 0;

    return Math.round(parsed * rate); // Làm tròn VNĐ
  };
  const normalizeCSV = (row: any) => ({
    id: row.ID,
    name: row.Name,
    quantity: row.Quantity, // ✅ sửa thành đúng key
    frequency: row.Frequency,
    refill: row.Refill,
    finalCost: convertEuroToVND(row['Final Cost']),
    feeCost: convertEuroToVND(row['Fee Cost']),
    prescriptionFee: convertEuroToVND(row['Prescription Fee']),
  });

  return (
    <>
      <CSVReader
        onUploadAccepted={(results: any, file: File) => {
          const parsed = results.data
            .map((r: any) => normalizeCSV(r))
            .filter((r: any) => r.id && r.name);

          setCsvData(parsed);
          setSelectedFile(file);
          setShowPreview(true);
        }}
        config={{ header: true }}
      >
        {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }: any) => (
          <div className="w-full flex flex-col items-center justify-center mt-6">
            <div
              {...getRootProps()}
              className="w-full max-w-xl px-6 py-10 border-2 border-dashed border-blue-400 text-center bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all rounded-lg cursor-pointer shadow-sm"
            >
              <div className="flex flex-col items-center space-y-3">
                <i className="fa-solid fa-file-csv text-blue-600 text-4xl" />
                <p className="text-base text-gray-700">
                  {acceptedFile ? (
                    <strong className="text-blue-700">{acceptedFile.name}</strong>
                  ) : (
                    <>
                      <span className="font-medium text-blue-600">Kéo thả hoặc click</span> để chọn
                      file CSV
                    </>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  Chỉ hỗ trợ định dạng <code>.csv</code>
                </p>
              </div>
            </div>

            <div className="w-full mt-3 max-w-xl">
              <ProgressBar />
            </div>

            {acceptedFile && (
              <button
                type="button"
                {...getRemoveFileProps()}
                className="mt-4 text-sm text-red-600 hover:underline hover:text-red-800"
              >
                ❌ Xoá file
              </button>
            )}
          </div>
        )}
      </CSVReader>

      <Dialog open={showPreview} onClose={handleRemoveFile} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            borderBottom: '1px solid #eee',
            textAlign: 'center',
            fontSize: '1.25rem',
          }}
        >
          🧐 Xem trước dữ liệu Import ({csvData.length} thuốc)
        </DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Tên</strong>
                </TableCell>
                <TableCell>
                  <strong>SL</strong>
                </TableCell>
                <TableCell>
                  <strong>Tần suất</strong>
                </TableCell>
                <TableCell>
                  <strong>Refill</strong>
                </TableCell>
                <TableCell>
                  <strong>Giá cuối</strong>
                </TableCell>
                <TableCell>
                  <strong>Phí</strong>
                </TableCell>
                <TableCell>
                  <strong>Phí kê đơn</strong>
                </TableCell>
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
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Button onClick={handleRemoveFile} variant="outlined" color="inherit">
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            sx={{ backgroundColor: 'primary.main' }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Xác nhận Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

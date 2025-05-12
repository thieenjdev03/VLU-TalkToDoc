'use client'

import React, { useState } from 'react'

import {
  Box,
  Table,
  Dialog,
  Button,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress
} from '@mui/material'

import { API_URL } from 'src/config-global'

import { useSnackbar } from 'src/components/snackbar'

export default function CSVUploadModal({ open, onClose, onUpload }: any) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [importResult, setImportResult] = useState<any>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportResult(null)
      // Papa.parse(file, {
      //   header: true,
      //   skipEmptyLines: true,
      //   complete: (results) => {
      //     // const parsed = results.data.map((r: any) => ({
      //     //   id: r.ID,
      //     //   name: r.Name,
      //     //   quantity: r.Quanitty,
      //     //   frequency: r.Frequency,
      //     //   refill: r.Refill,
      //     //   finalCost: r['Final Cost'],
      //     //   feeCost: r['Fee Cost'],
      //     //   prescriptionFee: r['Prescription Fee'],
      //     // }));
      //   },
      // });
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    const formData = new FormData()
    formData.append('file', selectedFile)
    setProgress(0)

    try {
      setLoading(true)
      setUploading(true)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_URL}/api/v1/medicines/import`)

      xhr.upload.onprogress = function handleProgress(event) {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 99)
          setProgress(percent)
        }
      }

      xhr.onload = async function handleLoad() {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText)
          setImportResult({
            total: result.totalRows,
            created: result?.success?.count || 0,
            updated: result?.updated?.count || 0,
            duplicateInBatch: result?.duplicates?.count || 0,
            failed: result?.failed?.count || 0,
            taskId: result?.taskId,
            errors: result?.failed?.lines || [],
            success: result?.success?.lines || [],
            duplicates: result?.duplicates?.lines || []
          })
          onUpload?.(result)
          enqueueSnackbar('Import thành công!', { variant: 'success' })
        } else {
          enqueueSnackbar('Import thất bại.', { variant: 'error' })
        }
        setLoading(false)
        setUploading(false)
      }

      xhr.onerror = function handleError() {
        enqueueSnackbar('Import thất bại.', { variant: 'error' })
        setLoading(false)
        setUploading(false)
      }

      xhr.send(formData)
    } catch (err) {
      console.error(err)
      enqueueSnackbar('Import thất bại.', { variant: 'error' })
      setUploading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSample = () => {
    window.open('/sample-template.csv')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={600}>📄 Tải File CSV</DialogTitle>

      <DialogContent dividers>
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
              borderColor: '#60a5fa'
            }
          }}
          onClick={() => document.getElementById('csv-file-input')?.click()}
        >
          <i className="fa-solid fa-cloud-arrow-up fa-2xl text-gray-500 mb-3" />
          <Typography fontSize={15} color="text.secondary">
            <strong className="text-blue-600">Nhấn hoặc kéo thả</strong> để chọn
            file CSV
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
          <Box
            mt={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
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
        {uploading && (
          <Box mt={3}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Đang tải file lên máy chủ: {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
        {loading && (
          <Box mt={3}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Đang tải lên: {progress}%
            </Typography>
            <Box sx={{ width: '100%' }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          </Box>
        )}
        {importResult && (
          <Box mt={4}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              gutterBottom
            >
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
                mt: 1
              }}
            >
              <div>
                <strong>Tổng dòng dòng thuốc đã xử lý:</strong>{' '}
                {importResult.total}
              </div>
              <div>
                <strong>Đã tạo mới:</strong> {importResult.created}
              </div>
              <div>
                <strong>Đã cập nhật:</strong> {importResult.updated}
              </div>
              <div>
                <strong>Lỗi:</strong>{' '}
                <span
                  style={{ color: importResult.failed > 0 ? 'red' : 'green' }}
                >
                  {importResult.failed}
                </span>
              </div>
              {importResult.taskId && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Mã tác vụ:</strong> <span>{importResult.taskId}</span>
                </div>
              )}
            </Box>
            <Box mt={2} display="flex" gap={2}>
              <p style={{ fontWeight: 600, margin: '2px 0px' }}>
                Chọn để xem chi tiết:
              </p>
              <Button
                onClick={() => setShowSuccess(!showSuccess)}
                size="small"
                variant="outlined"
                color="success"
              >
                ✅ Dòng đã tạo ({importResult?.success?.length})
              </Button>
              <Button
                onClick={() => setShowDuplicates(!showDuplicates)}
                size="small"
                variant="outlined"
                color="warning"
              >
                ⚠️ Dòng bị trùng ({importResult.duplicates?.length})
              </Button>
              <Button
                onClick={() => setShowErrors(!showErrors)}
                size="small"
                variant="outlined"
                color="error"
              >
                ❌ Dòng lỗi ({importResult?.errors?.length})
              </Button>
            </Box>
          </Box>
        )}
        {showSuccess && importResult?.success?.length > 0 && (
          <Box mt={2}>
            <Typography fontWeight={600}>✅ Dòng đã tạo</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Dòng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importResult.success.map((line: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{JSON.stringify(line)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {showDuplicates && importResult?.duplicates?.length > 0 && (
          <Box mt={2}>
            <Typography fontWeight={600}>⚠️ Dòng bị trùng</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Dòng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importResult.duplicates.map((line: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{JSON.stringify(line)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {showErrors && importResult?.errors?.length > 0 && (
          <Box mt={2}>
            <Typography fontWeight={600} m={2} ml={0}>
              Số dòng thuốc import lỗi : {importResult?.errors?.length}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Dòng</TableCell>
                  <TableCell>Lý do</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importResult?.errors?.map((err: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{err.line}</TableCell>
                    <TableCell>{err.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
      {!importResult ? (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Huỷ
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Xác nhận'
            )}
          </Button>
        </DialogActions>
      ) : (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="contained" color="inherit">
            Hoàn Tất
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

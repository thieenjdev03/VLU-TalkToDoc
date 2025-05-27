import React, { useState } from 'react'
import { useSnackbar } from 'notistack'

import CloseIcon from '@mui/icons-material/Close'
import {
  Radio,
  Dialog,
  Button,
  TextField,
  RadioGroup,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel
} from '@mui/material'

import { cancelAppointment } from '../../api/appointment'

const CANCEL_REASONS = [
  'Không hài lòng với dịch vụ',
  'Tìm được giải pháp thay thế',
  'Lý do tài chính',
  'Không có thời gian phù hợp',
  'Khác (vui lòng ghi rõ)'
]

export default function CancelReasonDialog({
  open,
  onClose,
  appointmentId
}: {
  open: boolean
  onClose: () => void
  appointmentId: string
}) {
  const [reason, setReason] = useState('')
  const [otherText, setOtherText] = useState('')
  const isOther = reason === CANCEL_REASONS[CANCEL_REASONS.length - 1]
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (_id: string) => {
    setReason('')
    setOtherText('')
    const res = await cancelAppointment(_id, reason)
    if (res) {
      enqueueSnackbar('Huỷ lịch hẹn thành công', { variant: 'success' })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      onClose()
    } else {
      enqueueSnackbar('Huỷ lịch hẹn thất bại', { variant: 'error' })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <span style={{ flex: 1 }}>Huỷ lịch hẹn</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Vui lòng chọn lý do huỷ lịch hẹn:
        </Typography>
        <RadioGroup value={reason} onChange={e => setReason(e.target.value)}>
          {CANCEL_REASONS.map((label, i) => (
            <FormControlLabel
              key={i}
              value={label}
              control={<Radio />}
              label={label}
              sx={{ mb: i === CANCEL_REASONS.length - 1 ? 0 : 1 }}
            />
          ))}
        </RadioGroup>
        {isOther && (
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            placeholder="Nhập lý do cụ thể..."
            value={otherText}
            onChange={e => setOtherText(e.target.value.slice(0, 200))}
            helperText={`${otherText.length}/200`}
            sx={{ mt: 1 }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => handleSubmit(appointmentId)}
          disabled={!reason || (isOther && otherText.trim().length < 5)}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  )
}

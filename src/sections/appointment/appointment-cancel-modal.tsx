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
  {
    label: 'Không hài lòng với dịch vụ',
    value: 'khong_hai_long_voi_dich_vu',
    decreaseScore: 1
  },
  {
    label: 'Tìm được giải pháp thay thế',
    value: 'tim_duoc_giai_phap_thay_the'
  },
  { label: 'Lý do tài chính', value: 'ly_do_tai_chinh' },
  { label: 'Không có thời gian phù hợp', value: 'khong_co_thoi_gian_phu_hop' },
  { label: 'Bác Sĩ Vắng Mặt', value: 'bac_si_vang_mat', decreaseScore: 1 },
  { label: 'Khác (vui lòng ghi rõ)', value: 'khac_vui_long_ghi_ro' }
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
  const [selectedValue, setSelectedValue] = useState('')
  const [otherText, setOtherText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const selectedReason = CANCEL_REASONS.find(r => r.value === selectedValue)
  const isOther = selectedReason?.value === 'khac_vui_long_ghi_ro'

  const handleSubmit = async (_id: string) => {
    if (!selectedReason) return

    const payload = {
      ...selectedReason,
      otherText: isOther ? otherText.trim() : undefined
    }

    setIsSubmitting(true)

    const res = await cancelAppointment(_id, payload)

    if (res) {
      enqueueSnackbar('Huỷ lịch hẹn thành công', { variant: 'success' })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      onClose()
    } else {
      enqueueSnackbar('Huỷ lịch hẹn thất bại', { variant: 'error' })
      setIsSubmitting(false)
    }

    setSelectedValue('')
    setOtherText('')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <span style={{ flex: 1 }}>Huỷ lịch hẹn</span>
        <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Vui lòng chọn lý do huỷ lịch hẹn:
        </Typography>
        <RadioGroup
          value={selectedValue}
          onChange={e => setSelectedValue(e.target.value)}
        >
          {CANCEL_REASONS.map((item, i) => (
            <FormControlLabel
              key={i}
              value={item.value}
              control={<Radio disabled={isSubmitting} />}
              label={item.label}
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
            disabled={isSubmitting}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => handleSubmit(appointmentId)}
          disabled={
            !selectedValue ||
            (isOther && otherText.trim().length < 5) ||
            isSubmitting
          }
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  )
}

import { useMemo, useState, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import {
  Box,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
  Autocomplete
} from '@mui/material'

import { useAddOffer } from 'src/api/case'
import { useGetMedicine } from 'src/api/medicine'

import { CaseMedication } from 'src/types/case'
import { IMedicineItem } from 'src/types/medicine'

type PrescriptionFormProps = {
  caseId: string
  onSuccess?: () => void
  handleSubmit?: () => void
  medications?: (CaseMedication & {
    price?: string | number
    quantity?: string | number
  })[]
  setMedications?: React.Dispatch<
    React.SetStateAction<
      (CaseMedication & {
        price?: string | number
        quantity?: string | number
      })[]
    >
  >
  note?: string
  setNote?: React.Dispatch<React.SetStateAction<string>>
}

export default function PrescriptionForm({
  caseId,
  onSuccess,
  handleSubmit = () => {},
  medications: externalMedications,
  setMedications: setExternalMedications,
  note: externalNote,
  setNote: setExternalNote
}: PrescriptionFormProps) {
  const [medicines, setMedicines] = useState<IMedicineItem[]>([])
  const [internalMedications, setInternalMedications] = useState<
    (CaseMedication & { price?: string | number; quantity?: string | number })[]
  >([
    {
      medicationId: '',
      name: '',
      dosage: '',
      usage: '',
      duration: '',
      price: '',
      quantity: 1
    }
  ])
  const [internalNote, setInternalNote] = useState('')
  const medications =
    externalMedications !== undefined
      ? externalMedications
      : internalMedications
  const setMedications =
    setExternalMedications !== undefined
      ? setExternalMedications
      : setInternalMedications

  const note = externalNote !== undefined ? externalNote : internalNote
  const setNote =
    setExternalNote !== undefined ? setExternalNote : setInternalNote
  const { medicine, medicineLoading, medicineError, medicineValidating } =
    useGetMedicine({
      keyword: '',
      page: 1,
      limit: 10,
      sortField: 'name',
      sortOrder: 'asc'
    })

  useEffect(() => {
    if (medicine?.data?.length || []) {
      setMedicines(medicine?.data || [])
    } else if (medicineLoading || medicineError || medicineValidating) {
      setMedicines([])
    }
  }, [medicine, medicineLoading, medicineError, medicineValidating])

  // Tính tổng tiền tạm tính (tự động nhân số lượng với giá)
  const totalPrice = useMemo(
    () =>
      medications.reduce((sum, med) => {
        const price =
          med.price !== undefined && med.price !== null && med.price !== ''
            ? Number(med.price)
            : 0
        const quantity =
          med.quantity !== undefined &&
          med.quantity !== null &&
          med.quantity !== ''
            ? Number(med.quantity)
            : 1
        return (
          sum +
          (Number.isNaN(price) || Number.isNaN(quantity) ? 0 : price * quantity)
        )
      }, 0),
    [medications]
  )

  // Xử lý thay đổi thuốc
  const handleChange = (
    idx: number,
    field: keyof CaseMedication | 'price' | 'quantity',
    value: string
  ) => {
    setMedications(meds =>
      meds.map((med, i) =>
        i === idx
          ? {
              ...med,
              [field]: value,
              ...(field === 'medicationId'
                ? {
                    name: medicines.find(m => m._id === value)?.name || '',
                    price:
                      medicines.find(m => m._id === value)?.price?.toString() ||
                      '',
                    // reset quantity về 1 khi chọn thuốc mới
                    quantity: 1
                  }
                : {})
            }
          : med
      )
    )
  }

  // Thêm dòng thuốc mới
  const handleAddRow = () => {
    setMedications(meds => [
      ...meds,
      {
        medicationId: '',
        name: '',
        dosage: '',
        usage: '',
        duration: '',
        price: '',
        quantity: 1
      }
    ])
  }

  // Xoá dòng thuốc
  const handleRemoveRow = (idx: number) => {
    setMedications(meds => meds.filter((_, i) => i !== idx))
  }

  return (
    <>
      <Typography variant="h6" mb={2}>
        Kê đơn thuốc cho bệnh nhân
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {medications.map((med, idx) => {
            const price =
              med.price !== undefined && med.price !== null && med.price !== ''
                ? Number(med.price)
                : 0
            const quantity =
              med.quantity !== undefined &&
              med.quantity !== null &&
              med.quantity !== ''
                ? Number(med.quantity)
                : 1
            const lineTotal =
              !Number.isNaN(price) && !Number.isNaN(quantity)
                ? price * quantity
                : 0
            return (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <Autocomplete
                  options={medicines}
                  getOptionLabel={option => option.name || ''}
                  value={
                    medicines.find(item => item._id === med.medicationId) ||
                    null
                  }
                  onChange={(_, value) => {
                    handleChange(idx, 'medicationId', value?._id || '')
                  }}
                  sx={{ minWidth: 220 }}
                  renderInput={params => (
                    <TextField {...params} label="Thuốc" required />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                />
                <TextField
                  select
                  label="Số lượng"
                  value={med.quantity || 1}
                  onChange={e => handleChange(idx, 'quantity', e.target.value)}
                  sx={{ minWidth: 120 }}
                  required
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value="" disabled>
                    Chọn
                  </option>
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </TextField>
                <TextField
                  label="Liều dùng"
                  value={med.dosage}
                  onChange={e => handleChange(idx, 'dosage', e.target.value)}
                  sx={{ minWidth: 120 }}
                  required
                />
                <TextField
                  label="Cách dùng"
                  value={med.usage}
                  onChange={e => handleChange(idx, 'usage', e.target.value)}
                  sx={{ minWidth: 120 }}
                  required
                />
                <TextField
                  label="Thời gian"
                  value={med.duration}
                  onChange={e => handleChange(idx, 'duration', e.target.value)}
                  sx={{ minWidth: 100 }}
                  required
                />
                <TextField
                  label="Giá thuốc"
                  value={
                    med.price !== undefined &&
                    med.price !== null &&
                    med.price !== ''
                      ? Number(med.price * 1000).toLocaleString('vi-VN')
                      : ''
                  }
                  onChange={e => handleChange(idx, 'price', e.target.value)}
                  sx={{ minWidth: 100 }}
                  required
                  type="number"
                  inputProps={{ min: 0 }}
                />
                <Typography sx={{ minWidth: 120, ml: 1 }} color="primary">
                  {(lineTotal * 1000).toLocaleString('vi-VN')} đ
                </Typography>
                <IconButton
                  onClick={() => handleRemoveRow(idx)}
                  disabled={medications.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            )
          })}
          <Divider />
          <Box display="flex" justifyContent="center" alignItems="center">
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              variant="outlined"
              color="primary"
              size="large"
            >
              Thêm thuốc
            </Button>
          </Box>

          <TextField
            label="Ghi chú"
            value={note}
            onChange={e => setNote(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <Typography variant="subtitle1" color="primary" mt={1}>
            Tạm tính tổng: {(totalPrice * 1000).toLocaleString('vi-VN')} VNĐ
          </Typography>
        </Stack>
      </form>
    </>
  )
}

export function PrescriptionModal({
  open,
  onClose,
  caseId,
  onSuccess
}: {
  open: boolean
  onClose: () => void
  caseId: string
  onSuccess?: () => void
}) {
  const [medications, setMedications] = useState<
    (CaseMedication & { price?: string | number; quantity?: string | number })[]
  >([
    {
      medicationId: '',
      name: '',
      dosage: '',
      usage: '',
      duration: '',
      price: '',
      quantity: 1
    }
  ])
  const [note, setNote] = useState('')
  const { addOffer = async () => {}, isAdding } = useAddOffer(caseId) || {}
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (
      !medications.length ||
      medications.some(
        m =>
          !m.medicationId ||
          !m.dosage ||
          !m.usage ||
          !m.duration ||
          !m.name ||
          m.price === undefined ||
          m.price === null ||
          m.price === '' ||
          Number.isNaN(Number(m.price)) ||
          m.quantity === undefined ||
          m.quantity === null ||
          m.quantity === '' ||
          Number.isNaN(Number(m.quantity))
      )
    ) {
      setError('Vui lòng nhập đầy đủ thông tin thuốc')
      return
    }
    try {
      await addOffer({
        medications: medications.map(
          ({
            medicationId,
            dosage,
            usage,
            duration,
            name,
            price,
            quantity
          }) => ({
            medicationId,
            dosage,
            usage,
            duration,
            name,
            price: price ? Number(price) : 0,
            quantity: quantity ? Number(quantity) : 1
          })
        ),
        note
      } as any)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setError('Có lỗi khi lưu đơn thuốc')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Kê đơn thuốc</DialogTitle>
      <DialogContent>
        <PrescriptionForm
          caseId={caseId}
          medications={medications}
          setMedications={setMedications}
          note={note}
          setNote={setNote}
        />
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isAdding}>
          Đóng
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isAdding}
        >
          {isAdding ? 'Đang lưu...' : 'Kê đơn'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

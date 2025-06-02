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
import { useGetPharmacies } from 'src/api/pharmacy'

import { useSnackbar, enqueueSnackbar } from 'src/components/snackbar'

import { CaseMedication } from 'src/types/case'
import { IMedicineItem } from 'src/types/medicine'
import { IPharmacyItem } from 'src/types/pharmacy'

type PrescriptionFormProps = {
  caseId: string
  onSuccess?: () => void
  handleSubmit?: () => void
  medications?: (CaseMedication & {
    price?: number
    quantity?: number
  })[]
  setMedications?: React.Dispatch<
    React.SetStateAction<
      (CaseMedication & {
        price?: number
        quantity?: number
      })[]
    >
  >
  note?: string
  setNote?: React.Dispatch<React.SetStateAction<string>>
  pharmacyId?: string
  setPharmacyId?: React.Dispatch<React.SetStateAction<string>>
  shippingAddress?: string
  setShippingAddress?: React.Dispatch<React.SetStateAction<string>>
  phoneNumber?: string
  setPhoneNumber?: React.Dispatch<React.SetStateAction<string>>
}

export default function PrescriptionForm({
  caseId,
  onSuccess,
  handleSubmit = () => {},
  medications: externalMedications,
  setMedications: setExternalMedications,
  note: externalNote,
  setNote: setExternalNote,
  pharmacyId: externalPharmacyId,
  setPharmacyId: setExternalPharmacyId,
  shippingAddress: externalShippingAddress,
  setShippingAddress: setExternalShippingAddress,
  phoneNumber: externalPhoneNumber,
  setPhoneNumber: setExternalPhoneNumber
}: PrescriptionFormProps) {
  const [medicines, setMedicines] = useState<IMedicineItem[]>([])
  const { enqueueSnackbar } = useSnackbar()
  // Remove local address state, use shippingAddress prop/state instead
  // const [address, setAddress] = useState('')
  const [internalMedications, setInternalMedications] = useState<
    (CaseMedication & { price?: number; quantity?: number })[]
  >([
    {
      medicationId: '',
      name: '',
      dosage: '',
      usage: '',
      duration: '',
      price: 0,
      quantity: 1
    }
  ])
  const [internalNote, setInternalNote] = useState('')
  const [internalPharmacyId, setInternalPharmacyId] = useState('')
  const [internalShippingAddress, setInternalShippingAddress] = useState('')
  const [internalPhoneNumber, setInternalPhoneNumber] = useState('')
  const medications =
    externalMedications !== undefined
      ? externalMedications
      : internalMedications
  const setMedications =
    setExternalMedications !== undefined
      ? setExternalMedications
      : setInternalMedications
  const shippingAddress =
    externalShippingAddress !== undefined
      ? externalShippingAddress
      : internalShippingAddress
  const setShippingAddress =
    setExternalShippingAddress !== undefined
      ? setExternalShippingAddress
      : setInternalShippingAddress
  const phoneNumber =
    externalPhoneNumber !== undefined
      ? externalPhoneNumber
      : internalPhoneNumber
  const setPhoneNumber =
    setExternalPhoneNumber !== undefined
      ? setExternalPhoneNumber
      : setInternalPhoneNumber
  const note = externalNote !== undefined ? externalNote : internalNote
  const setNote =
    setExternalNote !== undefined ? setExternalNote : setInternalNote

  const pharmacyId =
    externalPharmacyId !== undefined ? externalPharmacyId : internalPharmacyId
  const setPharmacyId =
    setExternalPharmacyId !== undefined
      ? setExternalPharmacyId
      : setInternalPharmacyId

  const { medicine, medicineLoading, medicineError, medicineValidating } =
    useGetMedicine({
      keyword: '',
      page: 1,
      limit: 10,
      sortField: 'name',
      sortOrder: 'asc'
    })

  const {
    pharmacies,
    pharmaciesLoading,
    pharmaciesError,
    pharmaciesValidating
  } = useGetPharmacies({
    query: '',
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
        const price = med.price ?? 0
        const quantity = med.quantity ?? 1
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
    value: string | number
  ) => {
    setMedications(meds =>
      meds.map((med, i) => {
        if (i === idx) {
          const updatedMed = { ...med } as any

          if (field === 'medicationId') {
            const selectedMedicine = medicines.find(m => m._id === value)
            updatedMed.medicationId = value as string
            updatedMed.name = selectedMedicine?.name || ''
            updatedMed.price = selectedMedicine?.price
              ? Number(selectedMedicine.price)
              : 0
            updatedMed.quantity = 1
          } else if (field === 'price' || field === 'quantity') {
            updatedMed[field] =
              typeof value === 'string' ? Number(value) : value
          } else {
            updatedMed[field] = value
          }

          return updatedMed
        }
        return med
      })
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
        price: 0,
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
        Kê toa thuốc cho bệnh nhân
      </Typography>

      <Box mb={3} display="flex" flexDirection="column" gap={2}>
        <Autocomplete
          options={pharmacies?.data || []}
          getOptionLabel={(option: IPharmacyItem) =>
            `${option.name} - ${option.address}`
          }
          value={
            pharmacies?.data?.find(
              (pharmacy: IPharmacyItem) => pharmacy._id === pharmacyId
            ) || null
          }
          onChange={(_, value) => setPharmacyId(value?._id || '')}
          renderInput={params => (
            <TextField
              {...params}
              label="Chọn nhà thuốc mua thuốc"
              fullWidth
              required
              helperText={
                !pharmacyId ? 'Vui lòng chọn nhà thuốc để mua thuốc' : ''
              }
            />
          )}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          loading={pharmaciesLoading}
        />
        <TextField
          label="Địa chỉ"
          value={shippingAddress}
          onChange={e => setShippingAddress(e.target.value)}
          fullWidth
          multiline
        />
        <TextField
          label="Số điện thoại"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          fullWidth
          multiline
        />
      </Box>

      <Divider />
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" mb={2}>
          Thông tin toa thuốc
        </Typography>
        <Stack spacing={2}>
          {medications.map((med, idx) => {
            const price = med.price ?? 0
            const quantity = med.quantity ?? 1
            const lineTotal = price * quantity

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
                  onChange={e =>
                    handleChange(idx, 'quantity', Number(e.target.value))
                  }
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
                  value={med.price}
                  onChange={e =>
                    handleChange(idx, 'price', Number(e.target.value))
                  }
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
          <Typography variant="body1" color="grey" mt={1}>
            Phí vận chuyển: 30.000 VNĐ
          </Typography>
          <Typography variant="subtitle1" color="primary" mt={1}>
            Tạm tính tổng: {((totalPrice + 30) * 1000).toLocaleString('vi-VN')}{' '}
            VNĐ
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
    (CaseMedication & { price?: number; quantity?: number })[]
  >([
    {
      medicationId: '',
      name: '',
      dosage: '',
      usage: '',
      duration: '',
      price: 0,
      quantity: 1
    }
  ])
  const [note, setNote] = useState('')
  const [pharmacyId, setPharmacyId] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const { addOffer = async () => {}, isAdding } = useAddOffer(caseId) || {}
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!pharmacyId) {
      enqueueSnackbar('Vui lòng chọn nhà thuốc để mua thuốc', {
        variant: 'error'
      })
      return
    }

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
          m.price === 0 ||
          m.quantity === undefined ||
          m.quantity === null ||
          m.quantity === 0
      )
    ) {
      enqueueSnackbar('Vui lòng nhập đầy đủ thông tin thuốc', {
        variant: 'error'
      })
      return
    }

    // Validate shippingAddress and phoneNumber if needed
    // (Optional: add validation here if required)

    try {
      const res = await addOffer({
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
            price: price ?? 0,
            quantity: quantity ?? 1
          })
        ),
        note,
        pharmacyId,
        shippingAddress,
        shippingPhone: phoneNumber
      } as any)
      if (res?.data) {
        enqueueSnackbar('Kê toa thuốc thành công', {
          variant: 'success'
        })
      } else {
        enqueueSnackbar(res?.message || 'Có lỗi khi lưu toa thuốc', {
          variant: 'error'
        })
      }
      onClose()
    } catch (err) {
      enqueueSnackbar('Có lỗi khi lưu toa thuốc', {
        variant: 'error'
      })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Kê toa thuốc</DialogTitle>
      <DialogContent>
        <PrescriptionForm
          caseId={caseId}
          medications={medications}
          setMedications={setMedications}
          note={note}
          setNote={setNote}
          pharmacyId={pharmacyId}
          setPharmacyId={setPharmacyId}
          shippingAddress={shippingAddress}
          setShippingAddress={setShippingAddress}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
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

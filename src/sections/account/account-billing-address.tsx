// AccountBankInfo.tsx
import axios from 'axios'
import { useState } from 'react'

import PhoneIcon from '@mui/icons-material/Phone'
import LoadingButton from '@mui/lab/LoadingButton'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import {
  Card,
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'

import Iconify from 'src/components/iconify'

// Types
export type BankInfo = {
  accountNumber: string
  bankName: string
  branch: string
  accountHolder: string
  phoneNumber: string
}

export type UserProfile = {
  _id: string
  role: string
  bank?: BankInfo
}

export type Props = {
  userProfile?: UserProfile
  setUserProfile?: (profile: UserProfile) => void
}

export default function AccountBankInfo({
  userProfile,
  setUserProfile
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<BankInfo>({
    accountNumber: '',
    bankName: '',
    branch: '',
    accountHolder: '',
    phoneNumber: ''
  })

  const bank = userProfile?.bank || null

  const handleOpen = () => {
    setForm({
      accountNumber: bank?.accountNumber || '',
      bankName: bank?.bankName || '',
      branch: bank?.branch || '',
      accountHolder: bank?.accountHolder || '',
      phoneNumber: bank?.phoneNumber || ''
    })
    setError('')
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSubmit = async () => {
    if (!userProfile) return
    setLoading(true)
    setError('')
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    let endpoint = ''

    switch (userProfile.role) {
      case 'doctor':
        endpoint = `/api/v1/doctors/${userProfile._id}/bank`
        break
      case 'patient':
        endpoint = `/api/v1/patients/${userProfile._id}/bank`
        break
      case 'employee':
        endpoint = `/api/v1/employees/${userProfile._id}/bank`
        break
      default:
        setError('Role không hợp lệ')
        setLoading(false)
        return
    }

    try {
      await axios.post(`${baseURL}${endpoint}`, { bank: form })
      const { getUserById } = await import('src/api/user')
      const data = await getUserById(userProfile._id, userProfile.role)
      setUserProfile?.(data)
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Thông tin chuyển khoản</Typography>
        <Button
          onClick={handleOpen}
          startIcon={<Iconify icon="solar:bank-bold" />}
        >
          Cập nhật
        </Button>
      </Stack>

      {bank ? (
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccountBalanceIcon color="primary" />
            <Typography>{bank.bankName}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CreditCardIcon />
            <Typography>Số tài khoản: {bank.accountNumber}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccountCircleIcon />
            <Typography>Chủ tài khoản: {bank.accountHolder}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocationOnIcon />
            <Typography>Chi nhánh: {bank.branch}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PhoneIcon />
            <Typography>SĐT: {bank.phoneNumber}</Typography>
          </Stack>
        </Stack>
      ) : (
        <Typography color="text.secondary">
          Chưa có thông tin ngân hàng
        </Typography>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Cập nhật thông tin ngân hàng</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Số tài khoản"
              value={form.accountNumber}
              onChange={e =>
                setForm(f => ({ ...f, accountNumber: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Tên ngân hàng"
              value={form.bankName}
              onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Chi nhánh"
              value={form.branch}
              onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Chủ tài khoản"
              value={form.accountHolder}
              onChange={e =>
                setForm(f => ({ ...f, accountHolder: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="SĐT liên kết"
              value={form.phoneNumber}
              onChange={e =>
                setForm(f => ({ ...f, phoneNumber: e.target.value }))
              }
              fullWidth
            />
            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <LoadingButton
            onClick={handleSubmit}
            loading={loading}
            variant="contained"
          >
            Lưu
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

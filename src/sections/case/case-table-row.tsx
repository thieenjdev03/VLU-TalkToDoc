import moment from 'moment'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Collapse from '@mui/material/Collapse'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'

import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import { ConfirmDialog } from 'src/components/custom-dialog'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

interface City {
  name: string
  code: number
  division_type: string
  codename: string
  phone_code: number
}

interface MedicalHistory {
  condition: string
  diagnosisDate: string
  treatment: string
  _id: string
}

interface PatientAppointment {
  doctorId: string
  date: string
  status: string
  _id: string
}

interface Patient {
  _id: string
  username: string
  email: string
  fullName: string
  phoneNumber: string
  birthDate: string
  isActive: boolean
  city: City
  role: string
  gender: string
  medicalHistory: MedicalHistory[]
  address: string
  appointments: PatientAppointment[]
  id: string
  avatarUrl: string
}

interface Doctor {
  _id: string
  username: string
  email: string
  fullName: string
  phoneNumber: string
  isActive: boolean
  city: string
  role: string
  specialty: string[]
  hospital: string
  experienceYears: number
  licenseNo: string
  rank: string
  position: string
  registrationStatus: string
  availability: any[]
  id: string
  avatarUrl?: string
}

interface Payment {
  platformFee: number
  doctorFee: number
  discount: number
  total: number
  status: string
  paymentMethod: string
  totalFee: number
}

export interface Case {
  _id: string
  caseId: string
  patient: string
  specialty: {
    _id: string
    name: string
  }
  status: string
  isDeleted: boolean
  createdAt: string
  offers: any[]
  updatedAt: string
  appointmentId: {
    _id: string
    appointmentId: string
    patient: Patient
    doctor: Doctor
    specialty: string
    date: string
    slot: string
    timezone: string
    status: string
    payment: Payment
    createdAt: string
    updatedAt: string
  }
}

type Props = {
  row: Case
  selected: boolean
  onViewRow: VoidFunction
  onSelectRow: VoidFunction
  onDeleteRow: (id: string) => void
  userRole?: string
  children: React.ReactNode
}

export default function CaseTableRow({
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  userRole,
  children
}: Props) {
  const confirm = useBoolean()
  const collapse = useBoolean()
  const popover = usePopover()
  const router = useRouter()
  function getStatusLabel(_status: string) {
    if (_status === 'completed') return 'Hoàn thành'
    if (_status === 'pending') return 'Chờ xử lý'
    if (_status === 'assigned') return 'Đã tiếp nhận'
    if (_status === 'cancelled') return 'Đã hủy'
    if (_status === 'refunded') return 'Hoàn tiền'
    if (_status === 'draft') return 'Bản nháp'
    if (_status === 'PENDING') return 'Chờ xử lý'
    return _status
  }

  function getStatusColor(_status: string) {
    if (_status === 'completed') return 'success'
    if (_status === 'pending' || _status === 'PENDING') return 'warning'
    if (_status === 'assigned') return 'info'
    if (_status === 'cancelled') return 'error'
    if (_status === 'refunded') return 'info'
    if (_status === 'draft') return 'default'
    return 'default'
  }

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell>
        <Box
          onClick={onViewRow}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          {row?.caseId || '-'}
        </Box>
      </TableCell>

      {userRole !== 'PATIENT' ? (
        // Hiển thị thông tin bệnh nhân cho bác sĩ
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={row.appointmentId?.patient?.fullName || ''}
            src={row.appointmentId?.patient?.avatarUrl || ''}
            sx={{ mr: 2 }}
          />
          <ListItemText
            primary={row.appointmentId?.patient?.fullName || '-'}
            secondary={`${row.appointmentId?.patient?.phoneNumber || '-'} - ${
              row.appointmentId?.patient?.email || '-'
            }`}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled'
            }}
          />
        </TableCell>
      ) : (
        // Hiển thị thông tin bác sĩ cho bệnh nhân
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={row.appointmentId?.doctor?.fullName || ''}
            src={row.appointmentId?.doctor?.avatarUrl || ''}
            sx={{ mr: 2 }}
          />
          <ListItemText
            primary={row.appointmentId?.doctor?.fullName || '-'}
            secondary={`${row.appointmentId?.doctor?.phoneNumber || '-'} - ${
              row.appointmentId?.doctor?.email || '-'
            }`}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled'
            }}
          />
        </TableCell>
      )}
      {userRole === 'PATIENT' ? (
        <TableCell>
          <ListItemText
            primary={row.appointmentId?.patient?.fullName || '-'}
            secondary={row.specialty?.name || '-'}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled'
            }}
          />
        </TableCell>
      ) : (
        <TableCell>
          <ListItemText
            primary={row.appointmentId?.doctor?.fullName || '-'}
            secondary={row.specialty?.name || '-'}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled'
            }}
          />
        </TableCell>
      )}

      <TableCell>
        <ListItemText
          primary={moment(row.appointmentId?.date).format('DD/MM/YYYY') || '-'}
          secondary={row.appointmentId?.slot || '-'}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled'
          }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={`${row.appointmentId?.payment?.total?.toLocaleString('vi-VN') || '0'}đ`}
          secondary={
            row.appointmentId?.payment?.status === 'PAID'
              ? 'Đã thanh toán'
              : 'Chưa thanh toán'
          }
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            component: 'span',
            color:
              row.appointmentId?.payment?.status === 'PAID'
                ? 'success.main'
                : 'error.main'
          }}
        />
      </TableCell>

      <TableCell>
        <Label variant="soft" color={getStatusColor(row.status.toLowerCase())}>
          {getStatusLabel(row.status.toLowerCase())}
        </Label>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={moment(row.createdAt).format('DD/MM/YYYY')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover'
            })
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        <IconButton
          color={popover.open ? 'inherit' : 'default'}
          onClick={popover.onOpen}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  )

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={12}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Stack component={Paper} sx={{ m: 1.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              sx={{ p: 2, typography: 'subtitle2' }}
            >
              <Box sx={{ flexGrow: 1 }}>Chi tiết thanh toán</Box>
            </Stack>

            <Stack spacing={2} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ typography: 'body2' }}>Phí nền tảng:</Box>
                <Box sx={{ typography: 'subtitle2' }}>
                  {`${row.appointmentId?.payment?.platformFee?.toLocaleString('vi-VN') || '0'}đ`}
                </Box>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ typography: 'body2' }}>Phí bác sĩ:</Box>
                <Box sx={{ typography: 'subtitle2' }}>
                  {`${row.appointmentId?.payment?.doctorFee?.toLocaleString('vi-VN') || '0'}đ`}
                </Box>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ typography: 'body2' }}>Giảm giá:</Box>
                <Box sx={{ typography: 'subtitle2' }}>
                  {`${row.appointmentId?.payment?.discount?.toLocaleString('vi-VN') || '0'}đ`}
                </Box>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ typography: 'body2' }}>Tổng cộng:</Box>
                <Box sx={{ typography: 'subtitle2' }}>
                  {`${row.appointmentId?.payment?.total?.toLocaleString('vi-VN') || '0'}đ`}
                </Box>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ typography: 'body2' }}>Trạng thái:</Box>
                <Label
                  variant="soft"
                  color={
                    row.appointmentId?.payment?.status === 'PAID'
                      ? 'success'
                      : 'error'
                  }
                >
                  {row.appointmentId?.payment?.status === 'PAID'
                    ? 'Đã thanh toán'
                    : 'Chưa thanh toán'}
                </Label>
              </Stack>
            </Stack>
          </Stack>
        </Collapse>
      </TableCell>
    </TableRow>
  )

  return (
    <>
      {renderPrimary}
      {renderSecondary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue()
            popover.onClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Xoá
        </MenuItem>
        <MenuItem
          onClick={() => {
            router.push(`/dashboard/case/${row?._id}`)
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Xem Chi Tiết
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xoá"
        content="Bạn có chắc chắn muốn xoá?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => onDeleteRow(row?._id)}
          >
            Xoá
          </Button>
        }
      />
    </>
  )
}

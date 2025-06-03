import moment from 'moment'
import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import ListItemText from '@mui/material/ListItemText'
import { Stack, Tooltip, Checkbox, IconButton, Typography } from '@mui/material'

import { useBoolean } from 'src/hooks/use-boolean'

import { useCallStore } from 'src/store/call-store'
import {
  deleteAppointment,
  rescheduleAppointment,
  doctorRejectAppointment,
  doctorConfirmAppointment
} from 'src/api/appointment'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import { useSnackbar } from 'src/components/snackbar'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

import BookingTimeModal from './appointment-reschedule-modal'

// ----------------------------------------------------------------------

type Props = {
  row: any
  selected: boolean
  onViewRow: VoidFunction
  onSelectRow: VoidFunction
  typeUser: string
  onDeleteRow: VoidFunction
  user: any
  doctorsList: any[]
  onCancelAppointment: VoidFunction
}

export default function AppointmentTableRow({
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  typeUser,
  doctorsList,
  user,
  onCancelAppointment
}: Props) {
  const { appointmentId, patient, status, payment } = row as any
  const quickEdit = useBoolean()
  const confirm = useBoolean()
  const popover = usePopover()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Sử dụng call store
  const { openCall } = useCallStore()

  // Cập nhật hàm handleOpenCall để sử dụng store
  const handleOpenCall = () => {
    openCall(row)
  }
  const conditionEditAppointment = (appointmentDate: string) => {
    const isPendingOrConfirmed = row?.status === 'PENDING'
    const isAfterCurrentDate =
      moment(appointmentDate).isAfter(moment(), 'day') &&
      row?.status === 'CONFIRMED'
    return isPendingOrConfirmed || isAfterCurrentDate
  }

  const handleEditAppointment = () => {
    quickEdit.onTrue()
  }

  const handleDoctorConfirm = async (accepted: boolean, reason: string) => {
    try {
      setLoading(true)
      let res = null
      if (accepted) {
        res = await doctorConfirmAppointment(row._id)
      } else {
        res = await doctorRejectAppointment(row._id, reason)
      }
      if (res) {
        enqueueSnackbar(
          accepted
            ? 'Đã chấp nhận lịch hẹn thành công!'
            : 'Đã từ chối lịch hẹn!',
          {
            variant: 'success'
          }
        )
        setLoading(false)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        enqueueSnackbar('Có lỗi xảy ra khi cập nhật lịch hẹn.', {
          variant: 'error'
        })
        setLoading(false)
      }
    } catch (error) {
      enqueueSnackbar('Có lỗi xảy ra khi cập nhật lịch hẹn.', {
        variant: 'error'
      })
      setLoading(false)
    }
  }
  const handleReschedule = async (payload: any, _id: string) => {
    if (!payload?.doctor?._id) {
      enqueueSnackbar('Không tìm thấy bác sĩ!', { variant: 'error' })
      return
    }
    const response = await rescheduleAppointment(_id, {
      date: payload.date,
      slot: payload.slot
    })
    if (response.statusCode === 200) {
      enqueueSnackbar('Đã đặt lại lịch khám thành công!')
    }
  }

  const isOverdue =
    moment(row?.date).isBefore(moment(), 'day') &&
    (status === 'CONFIRMED' || status === 'PENDING')

  const handleDeleteAppointment = async () => {
    if (user?.role !== 'ADMIN') {
      enqueueSnackbar('Bạn không có quyền xoá lịch hẹn.', { variant: 'error' })
      return
    }
    if (!row?._id) {
      enqueueSnackbar('Không tìm thấy ID lịch hẹn để xoá.', {
        variant: 'error'
      })
      return
    }
    setDeleting(true)
    try {
      const token =
        user?.accessToken || localStorage.getItem('accessToken') || ''
      if (!token) {
        enqueueSnackbar('Không tìm thấy token xác thực.', { variant: 'error' })
        setDeleting(false)
        return
      }

      const res = await deleteAppointment(row._id)

      if (res.ok) {
        enqueueSnackbar('Xoá lịch hẹn thành công!', { variant: 'success' })
        setDeleting(false)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const data = await res.json().catch(() => ({}))
        enqueueSnackbar(data?.message || 'Có lỗi xảy ra khi xoá lịch hẹn.', {
          variant: 'error'
        })
        setDeleting(false)
      }
    } catch (err) {
      enqueueSnackbar('Có lỗi xảy ra khi xoá lịch hẹn.', { variant: 'error' })
      setDeleting(false)
    }
  }

  const doctorField = (
    <TableRow hover selected={selected}>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>
        <Box
          onClick={onViewRow}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {appointmentId}
        </Box>
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          alt={patient?.fullName}
          src={patient?.avatarUrl}
          sx={{ mr: 2 }}
        />
        <ListItemText
          primary={patient?.fullName || 'Chưa xác định'}
          secondary={patient?.email || '-'}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled'
          }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={row?.date || moment().format('DD/MM/YYYY')}
          secondary={`${row?.slot || '00:00'} giờ`}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption'
          }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2">{row.specialty?.name}</Typography>
      </TableCell>

      <TableCell>{payment?.total?.toLocaleString('vi-VN') || 0}đ</TableCell>

      <TableCell align="center">
        {status === 'PENDING' && typeUser === 'DOCTOR' ? (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              color="success"
              sx={{ width: '80px', whiteSpace: 'nowrap' }}
              onClick={() => {
                handleDoctorConfirm(true, '')
              }}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Chấp Nhận'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                handleDoctorConfirm(false, 'Bác sĩ từ chối lịch khám')
              }}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Từ chối'}
            </Button>
          </Stack>
        ) : (
          <Label
            variant="soft"
            color={
              (status === 'CONFIRMED' && 'success') ||
              (status === 'REJECTED' && 'error') ||
              (status === 'PENDING' && 'warning') ||
              (status === 'CANCELLED' && 'error') ||
              (status === 'COMPLETED' && 'success') ||
              'default'
            }
          >
            {status === 'CONFIRMED' && 'Đã xác nhận'}
            {status === 'REJECTED' && 'Đã huỷ'}
            {status === 'PENDING' && 'Đang chờ'}
            {status === 'CANCELLED' && 'Đã huỷ'}
            {status === 'COMPLETED' && 'Đã hoàn thành'}
          </Label>
        )}
      </TableCell>

      <TableCell>
        <Checkbox
          checked={row?.payment?.status === 'PAID'}
          color={row?.payment?.status === 'PAID' ? 'success' : 'error'}
          onChange={() => {}}
          disabled
        />
      </TableCell>
      <TableCell>
        {row?.status === 'CONFIRMED' && (
          <Button
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            variant="contained"
            color="primary"
            onClick={handleOpenCall}
          >
            <Iconify icon="ic:outline-phone-forwarded" />
            <span>Gọi</span>
          </Button>
        )}
      </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        {conditionEditAppointment(row?.date) && (
          <>
            <Tooltip title="Sửa Lịch" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={handleEditAppointment}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={popover.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </>
        )}
      </TableCell>
    </TableRow>
  )
  const patientField = (
    <TableRow hover selected={selected}>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>
        <Box
          onClick={onViewRow}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          {appointmentId}
        </Box>
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          alt={row?.doctor?.fullName}
          src={row?.doctor?.avatarUrl}
          sx={{ mr: 2 }}
        />
        <ListItemText
          primary={row?.doctor?.fullName || '-'}
          secondary={`${row?.doctor?.phoneNumber || '-'} - ${
            row?.doctor?.email || '-'
          }`}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled'
          }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={row?.date || moment().format('DD/MM/YYYY')}
          secondary={`${row?.slot || '00:00'} giờ`}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption'
          }}
        />
      </TableCell>
      <TableCell>{row?.doctor?.phoneNumber || '-'}</TableCell>

      <TableCell>
        <Typography variant="body2">{row?.specialty?.name || '-'}</Typography>
      </TableCell>

      <TableCell>{payment?.total?.toLocaleString('vi-VN') || 0}đ</TableCell>

      <TableCell
        align="center"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          justifyContent: 'center'
        }}
      >
        <Label
          variant="soft"
          color={
            (status === 'CONFIRMED' && 'success') ||
            (status === 'REJECTED' && 'error') ||
            (status === 'PENDING' && 'warning') ||
            (status === 'CANCELLED' && 'error') ||
            (status === 'COMPLETED' && 'success') ||
            'default'
          }
        >
          {status === 'CONFIRMED' && 'Đã xác nhận'}
          {status === 'REJECTED' && 'Đã huỷ'}
          {status === 'PENDING' && 'Đang chờ'}
          {status === 'CANCELLED' && 'Đã huỷ'}
          {status === 'COMPLETED' && 'Đã hoàn thành'}
        </Label>
        <span style={{ color: 'red', whiteSpace: 'nowrap' }}>
          {isOverdue && '(Quá hạn)'}
        </span>
      </TableCell>

      <TableCell align="center">
        <Checkbox
          checked={row?.payment?.status === 'PAID'}
          color={row?.payment?.status === 'PAID' ? 'success' : 'error'}
          onChange={() => {}}
          disabled
        />
      </TableCell>

      <TableCell align="center">
        {row?.status === 'CONFIRMED' && !isOverdue && (
          <Button
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
            variant="contained"
            color="primary"
            onClick={handleOpenCall}
          >
            <Iconify icon="ic:outline-phone-forwarded" />
            <span>Gọi</span>
          </Button>
        )}
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{row.reason || '-'}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{row.rating || '-'}</Typography>
      </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        {conditionEditAppointment(row?.date) && (
          <>
            <Tooltip title="Sửa Lịch" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={handleEditAppointment}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={popover.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </>
        )}
      </TableCell>
    </TableRow>
  )

  return (
    <>
      {typeUser === 'PATIENT' ? patientField : doctorField}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            onCancelAppointment()
            confirm.onTrue()
            popover.onClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Huỷ Lịch
        </MenuItem>
      </CustomPopover>
      <BookingTimeModal
        open={quickEdit.value}
        onClose={() => quickEdit.onFalse()}
        doctors={doctorsList}
        defaultData={{
          appointmentId: row?._id,
          doctor: row?.doctor,
          date: row?.appointment?.date || '',
          slot: row?.appointment?.slot || ''
        }}
        onConfirm={(payload: any) => {
          handleReschedule(payload, row?._id)
          quickEdit.onFalse()
        }}
      />
      {/* <ConfirmDialog
        open={confirm.value || false}
        onClose={confirm.onFalse}
        title="Xoá lịch hẹn"
        content="Bạn có chắc chắn muốn xoá chứ?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAppointment}
            disabled={deleting}
          >
            {deleting ? 'Đang xoá...' : 'Xoá'}
          </Button>
        }
      /> */}
    </>
  )
}

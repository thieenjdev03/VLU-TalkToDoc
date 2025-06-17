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
  typeUser: string
  user: any
  doctorsList: any[]
  onCancelAppointment: VoidFunction
}

export default function AppointmentTableRow({
  row,
  selected,
  onViewRow,
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
              sx={{
                width: '80px',
                whiteSpace: 'nowrap',
                textTransform: 'none', // không viết hoa, giữ đúng định dạng
                overflow: 'hidden',
                textOverflow: 'ellipsis' // optional: nếu text dài quá thì hiện ...
              }}
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
              sx={{
                width: '80px',
                whiteSpace: 'nowrap',
                textTransform: 'none', // không viết hoa, giữ đúng định dạng
                overflow: 'hidden',
                textOverflow: 'ellipsis' // optional: nếu text dài quá thì hiện ...
              }}
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
            {isOverdue && (
              <span style={{ color: 'red', whiteSpace: 'nowrap' }}>
                &nbsp;(Quá hạn)
              </span>
            )}
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
        {row?.status === 'CONFIRMED' && !isOverdue && (
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

      <TableCell align="center">
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
        {isOverdue && (
          <span style={{ color: 'red', whiteSpace: 'nowrap' }}>(Quá hạn)</span>
        )}
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
        {row?.rating?.ratingScore ? (
          <Tooltip title={row.rating.description || '-'} arrow>
            <Typography
              variant="body2"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'help'
              }}
            >
              {row.rating.ratingScore}
              <Iconify
                icon="solar:star-bold"
                sx={{ fontSize: 16, ml: 0.5, color: 'warning.main' }}
              />
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.disabled">
            –
          </Typography>
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
    </>
  )
}

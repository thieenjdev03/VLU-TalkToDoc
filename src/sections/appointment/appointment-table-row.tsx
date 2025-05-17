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

import {
  deleteAppointment,
  doctorConfirmAppointment
} from 'src/api/appointment'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import { useSnackbar } from 'src/components/snackbar'
import { ConfirmDialog } from 'src/components/custom-dialog'
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
  setOpenCall: (open: boolean) => void
  user: any
  setCurrentAppointment: (appointment: any) => void
  doctorsList: any[]
  // Nếu có prop để mở modal sửa lịch, cần truyền vào đây, ví dụ:
  // onOpenEditModal?: VoidFunction;
}

export default function AppointmentTableRow({
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  typeUser,
  setOpenCall,
  setCurrentAppointment,
  doctorsList,
  user // onOpenEditModal, // Nếu có prop này
}: Props) {
  const { appointmentId, patient, status, payment } = row as any
  const quickEdit = useBoolean()
  const confirm = useBoolean()
  const popover = usePopover()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Vấn đề: Khi click vào IconButton "Sửa Lịch", chỉ gọi quickEdit.onTrue(),
  // nhưng không có component/modal nào render dựa vào quickEdit.value hoặc editForm.value.
  // => Modal sửa lịch sẽ không hiện ra vì không có gì lắng nghe quickEdit.value hoặc editForm.value.
  // Giả sử modal sửa lịch nằm ở component cha, cần truyền prop mở modal lên cha (ví dụ: onOpenEditModal).
  // Nếu muốn mở modal ở đây, cần render modal dựa vào quickEdit.value hoặc editForm.value.

  const handleOpenCall = () => {
    setCurrentAppointment(row)
    setOpenCall(true)
  }

  // Sửa lại hàm này để dùng cho nút sửa lịch
  const handleEditAppointment = () => {
    // Nếu có prop onOpenEditModal thì gọi nó
    // if (onOpenEditModal) {
    //   setCurrentAppointment(row);
    //   onOpenEditModal();
    //   return;
    // }
    // Nếu muốn mở modal tại đây, cần render modal dựa vào quickEdit.value hoặc editForm.value
    quickEdit.onTrue()
    setCurrentAppointment(row)
  }

  const handleDoctorConfirm = async (accepted: boolean) => {
    try {
      setLoading(true)
      const data = {
        id: row._id,
        accepted
      }
      const res = await doctorConfirmAppointment(data)
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

  // Hàm xoá lịch hẹn sử dụng fetch với phương thức DELETE
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

      <TableCell>{payment?.totalFee?.toLocaleString('vi-VN') || 0}đ</TableCell>

      <TableCell align="center">
        {status === 'PENDING' && typeUser === 'DOCTOR' ? (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => {
                handleDoctorConfirm(true)
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
                handleDoctorConfirm(false)
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
              'default'
            }
          >
            {status === 'CONFIRMED' && 'Đã xác nhận'}
            {status === 'REJECTED' && 'Đã huỷ'}
            {status === 'PENDING' && 'Đang chờ'}
          </Label>
        )}
      </TableCell>

      <TableCell>
        <Checkbox
          checked={row?.payment?.billing_status === 'PAID'}
          color={row?.payment?.billing_status === 'PAID' ? 'success' : 'error'}
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
        <Tooltip title="Sửa Lịch" placement="top" arrow>
          <IconButton
            color={quickEdit.value ? 'inherit' : 'default'}
            // onClick={quickEdit.onTrue}
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
          primary={row?.doctor?.fullName || 'Chưa xác định'}
          secondary={row?.doctor?.email || '-'}
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

      <TableCell>{payment?.totalFee?.toLocaleString('vi-VN') || 0}đ</TableCell>

      <TableCell align="center">
        <Label
          variant="soft"
          color={
            (status === 'CONFIRMED' && 'success') ||
            (status === 'REJECTED' && 'error') ||
            (status === 'PENDING' && 'warning') ||
            'default'
          }
        >
          {status === 'CONFIRMED' && 'Đã xác nhận'}
          {status === 'REJECTED' && 'Đã huỷ'}
          {status === 'PENDING' && 'Đang chờ'}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Checkbox
          checked={row?.payment?.billing_status === 'PAID'}
          color={row?.payment?.billing_status === 'PAID' ? 'success' : 'error'}
          onChange={() => {}}
          disabled
        />
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{row.cancelReason || '-'}</Typography>
      </TableCell>

      <TableCell align="center">
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
        <Tooltip title="Sửa Lịch" placement="top" arrow>
          <IconButton
            color={quickEdit.value ? 'inherit' : 'default'}
            // onClick={quickEdit.onTrue}
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
      </TableCell>
    </TableRow>
  )

  // Giải thích:
  // - Khi click vào nút sửa lịch, chỉ gọi quickEdit.onTrue() hoặc handleEditAppointment().
  // - Nhưng không có modal nào render dựa vào quickEdit.value hoặc editForm.value ở đây.
  // - Để modal hiện ra, cần render component modal sửa lịch ở đây, ví dụ:
  //   {quickEdit.value && <EditAppointmentModal open={quickEdit.value} onClose={quickEdit.onFalse} appointment={row} />}
  // - Hoặc truyền prop mở modal lên component cha.

  return (
    <>
      {typeUser === 'PATIENT' ? patientField : doctorField}

      {/* Ví dụ: render modal sửa lịch nếu quickEdit.value true */}
      {/* 
      {quickEdit.value && (
        <EditAppointmentModal
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          appointment={row}
        />
      )}
      */}

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
      </CustomPopover>
      <BookingTimeModal
        open={quickEdit.value}
        onClose={() => quickEdit.onFalse()}
        doctors={doctorsList}
        defaultData={{
          doctor: row?.doctor,
          date: row?.appointment?.date || '',
          slot: row?.appointment?.slot || ''
        }}
        onConfirm={(payload: any) => {
          console.log('Updated:', payload)
        }}
      />
      <ConfirmDialog
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
      />
    </>
  )
}

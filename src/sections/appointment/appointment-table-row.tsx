import moment from 'moment';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import { Stack, Tooltip, Checkbox, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { doctorConfirmAppointment } from 'src/api/appointment';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
  onViewRow: VoidFunction;
  onSelectRow: VoidFunction;
  typeUser: string;
  onDeleteRow: VoidFunction;
};

export default function AppointmentTableRow({
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  typeUser,
}: Props) {
  const { appointmentId, patient, status, payment } = row as any;
  const quickEdit = useBoolean();
  const confirm = useBoolean();
  const popover = usePopover();
  const { enqueueSnackbar } = useSnackbar(); // thêm dòng này
  const [loading, setLoading] = useState(false);

  console.log('row check', row);
  const handleDoctorConfirm = async (accepted: boolean) => {
    try {
      setLoading(true);
      const data = {
        id: row._id,
        accepted,
      };
      const res = await doctorConfirmAppointment(data);
      if (!res.error) {
        enqueueSnackbar(accepted ? 'Đã chấp nhận lịch hẹn thành công!' : 'Đã từ chối lịch hẹn!', {
          variant: accepted ? 'success' : 'error',
        });
        setLoading(false);
      } else {
        enqueueSnackbar('Có lỗi xảy ra khi cập nhật lịch hẹn.', { variant: 'error' });
        setLoading(false);
      }
    } catch (error) {
      enqueueSnackbar('Có lỗi xảy ra khi cập nhật lịch hẹn.', { variant: 'error' });
      setLoading(false);
    }
  };

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
        <Avatar alt={patient?.fullName} src={patient?.avatarUrl} sx={{ mr: 2 }} />
        <ListItemText
          primary={patient?.fullName || 'Chưa xác định'}
          secondary={patient?.email || '-'}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={row?.date || moment().format('DD/MM/YYYY')}
          secondary={`${row?.slot || '00:00'} giờ`}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2">{row.specialty?.name}</Typography>
      </TableCell>

      <TableCell>{payment?.totalFee?.toLocaleString('vi-VN') || 0}đ</TableCell>

      <TableCell>{payment?.paymentMethod?.toUpperCase() || '-'}</TableCell>

      <TableCell align="center">
        {status === 'PENDING' && typeUser === 'DOCTOR' ? (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => {
                handleDoctorConfirm(true);
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
                handleDoctorConfirm(false);
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
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Sửa nhanh" placement="top" arrow>
          <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
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
        <Avatar alt={row?.doctor?.fullName} src={row?.doctor?.avatarUrl} sx={{ mr: 2 }} />
        <ListItemText
          primary={row?.doctor?.fullName || 'Chưa xác định'}
          secondary={row?.doctor?.email || '-'}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={row?.date || moment().format('DD/MM/YYYY')}
          secondary={`${row?.slot || '00:00'} giờ`}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
        />
      </TableCell>
      <TableCell>{row.doctor.phoneNumber || '-'}</TableCell>

      <TableCell>
        <Typography variant="body2">{row.specialty?.name}</Typography>
      </TableCell>

      <TableCell>{payment?.totalFee?.toLocaleString('vi-VN') || 0}đ</TableCell>

      <TableCell>{payment?.paymentMethod?.toUpperCase() || '-'}</TableCell>

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

      <TableCell>
        <Checkbox
          checked={row?.payment?.billing_status === 'PAID'}
          color={row?.payment?.billing_status === 'PAID' ? 'success' : 'error'}
          onChange={() => {
            // Handle checkbox change logic here if needed
          }}
          disabled
        />
      </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Sửa nhanh" placement="top" arrow>
          <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
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
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Xoá
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value || false}
        onClose={confirm.onFalse}
        title="Xoá lịch hẹn"
        content="Bạn có chắc chắn muốn xoá chứ?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow(); // Changed from the incorrect syntax
              confirm.onFalse(); // This will close the modal
            }}
          >
            Xoá
          </Button>
        }
      />
    </>
  );
}

import moment from 'moment'

import Link from '@mui/material/Link'
import Avatar from '@mui/material/Avatar'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'

import Label from 'src/components/label'

import { IInvoice } from 'src/types/invoice'

// ----------------------------------------------------------------------

type Props = {
  row: IInvoice
  selected: boolean
  onSelectRow: VoidFunction
  onViewRow: VoidFunction
}

export default function InvoiceTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow
}: Props) {
  const {
    orderId,
    createdAt,
    salaryStatus,
    amount,
    appointmentInfo,
    doctorInfo
  } = row as any

  const renderStatus = (statusParams: string) => {
    switch (statusParams) {
      case 'paid':
        return 'Đã thanh toán'
      case 'confirmed':
        return 'Đã xác nhận'
      case 'pending':
        return 'Đang chờ'
      case 'cancelled':
        return 'Đã hủy'
      case 'overdue':
        return 'Quá hạn'
      case 'completed':
        return 'Đã hoàn thành'
      default:
        return 'Chưa xác định'
    }
  }
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell align="center" padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell padding="checkbox">
          <Typography variant="body2" noWrap>
            {orderId}
          </Typography>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar
              alt={doctorInfo?.fullName}
              src={doctorInfo?.avatarUrl}
              sx={{ mr: 2 }}
            >
              {doctorInfo?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
            {doctorInfo?.fullName ? (
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="body2" noWrap>
                    {doctorInfo?.fullName}
                  </Typography>
                }
                secondary={
                  <Link
                    noWrap
                    variant="body2"
                    onClick={onViewRow}
                    sx={{ color: 'text.disabled', cursor: 'pointer' }}
                  >
                    {doctorInfo?.email}
                  </Link>
                }
              />
            ) : (
              <Typography variant="body2" noWrap>
                Chưa xác định
              </Typography>
            )}
          </div>
        </TableCell>
        <TableCell>
          <ListItemText
            primary={moment(createdAt).format('DD/MM/YYYY')}
            secondary={moment(createdAt).format('HH:mm')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption'
            }}
          />
        </TableCell>
        <TableCell align="center">
          {amount?.toLocaleString() || 0} VNĐ
        </TableCell>
        <TableCell align="center">10%</TableCell>
        <TableCell align="center">
          {(amount * 0.9).toLocaleString() || 0} VNĐ
        </TableCell>

        <TableCell align="center">
          <Label
            variant="soft"
            color={
              (appointmentInfo?.status?.toLowerCase() === 'paid' &&
                'success') ||
              (appointmentInfo?.status?.toLowerCase() === 'pending' &&
                'warning') ||
              (appointmentInfo?.status?.toLowerCase() === 'confirmed' &&
                'info') ||
              (appointmentInfo?.status?.toLowerCase() === 'overdue' &&
                'error') ||
              (appointmentInfo?.status?.toLowerCase() === 'cancelled' &&
                'error') ||
              (appointmentInfo?.status?.toLowerCase() === 'completed' &&
                'success') ||
              'default'
            }
          >
            {renderStatus(appointmentInfo?.status?.toLowerCase() || '')}
          </Label>
        </TableCell>
        <TableCell align="center" padding="checkbox">
          <Checkbox disabled checked={salaryStatus} />
        </TableCell>
      </TableRow>

      {/* <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover> */}
      {/* 
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      /> */}
    </>
  )
}

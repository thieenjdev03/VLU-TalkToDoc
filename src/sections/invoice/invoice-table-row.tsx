import moment from 'moment';

import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import Label from 'src/components/label';

import { IInvoice } from 'src/types/invoice';

// ----------------------------------------------------------------------

type Props = {
  row: IInvoice;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
};

export default function InvoiceTableRow({ row, selected, onSelectRow, onViewRow }: Props) {
  const { orderId, createdAt, status, userInfo, amount } = row as any;

  const renderStatus = (statusParams: string) => {
    switch (statusParams) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chưa thanh toán';
      case 'overdue':
        return 'Quá hạn';
      case 'canceled':
        return 'Đã hủy';
      case 'completed':
        return 'Đã hoàn thành';
      default:
        return 'Chưa xác định';
    }
  };
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell padding="checkbox">
          <Typography variant="body2" noWrap>
            {orderId}
          </Typography>
        </TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={userInfo?.fullName} src={userInfo?.avatarUrl} sx={{ mr: 2 }}>
            {userInfo?.fullName?.charAt(0).toUpperCase()}
          </Avatar>
          {userInfo?.fullName ? (
            <ListItemText
              disableTypography
              primary={
                <Typography variant="body2" noWrap>
                  {userInfo?.fullName}
                </Typography>
              }
              secondary={
                <Link
                  noWrap
                  variant="body2"
                  onClick={onViewRow}
                  sx={{ color: 'text.disabled', cursor: 'pointer' }}
                >
                  {userInfo?.email}
                </Link>
              }
            />
          ) : (
            <Typography variant="body2" noWrap>
              Chưa xác định
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <ListItemText
            primary={moment(createdAt).format('DD/MM/YYYY')}
            secondary={moment(createdAt).format('HH:mm')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell>{amount.toLocaleString()} VNĐ</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'paid' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'overdue' && 'error') ||
              (status === 'canceled' && 'error') ||
              (status === 'completed' && 'success') ||
              'default'
            }
          >
            {renderStatus(status)}
          </Label>
        </TableCell>

        {/* <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell> */}
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
  );
}

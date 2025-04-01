import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import HospitalQuickEditForm from 'src/sections/hospital/quick-edit-form';

import { IHospitalItem } from 'src/types/hospital';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  onViewRow?: VoidFunction;
  row: IHospitalItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onRefreshData?: VoidFunction;
};

export default function HospitalTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  onRefreshData,
}: Props) {
  const { name, id, address, phoneNumber, isActive, isPublic } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const renderCells = () => (
    <>
      <TableCell>{id}</TableCell>
      <TableCell>
        <Typography variant="body1" noWrap>
          {name}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap>
          {address || '-'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{phoneNumber || '-'}</Typography>
      </TableCell>
      <TableCell>
        <Checkbox checked={isPublic} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={isActive} disabled />
      </TableCell>
    </>
  );
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        {renderCells()}
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

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {onViewRow && (
          <MenuItem
            onClick={() => {
              onViewRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            Xem
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Sửa
        </MenuItem>

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
        open={confirm.value}
        onClose={confirm.onFalse}
        title={`Xoá bệnh viện ${name}`}
        content="Bạn có chắc chắn muốn xoá chứ?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse(); // Add this line to close the modal
            }}
          >
            Xoá
          </Button>
        }
      />

      <HospitalQuickEditForm
        currentHospital={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onSuccess={onRefreshData}
      />
    </>
  );
}

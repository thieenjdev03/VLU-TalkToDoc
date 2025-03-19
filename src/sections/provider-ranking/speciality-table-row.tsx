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

import { IRankingItem } from 'src/types/provider-ranking';

import RankingQuickEditForm from './quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IRankingItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function RankingTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const { name, description, isActive, updatedAt, id } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const renderCells = () => (
    <>
      <TableCell>{id}</TableCell>
      <TableCell>
        <Typography variant="body1">{name}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{description || '-'}</Typography>
      </TableCell>
      <TableCell>
        <Checkbox checked={isActive} disabled />
      </TableCell>
      <TableCell>{updatedAt}</TableCell>
    </>
  );
  console.log(row);
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
        title={`Xoá chuyên khoa ${name}`}
        content="Bạn có chắc chắn muốn xoá chứ?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Xoá
          </Button>
        }
      />
      <RankingQuickEditForm
        currentRanking={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      />
    </>
  );
}

import moment from 'moment';

import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { formatCurrencyVND } from 'src/utils/formatCurrency';

import { IMedicineItem } from 'src/types/medicine';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  row: IMedicineItem;
  onSelectRow: VoidFunction;
};

export default function MedicineTableRow({ row, selected, onSelectRow }: Props) {
  const { name, updatedAt, quantity, id, price } = row;
  const renderCells = () => (
    <>
      <TableCell>{id}</TableCell>
      <TableCell>
        <Typography variant="body1">{name}</Typography>
      </TableCell>
      <TableCell>{formatCurrencyVND(price * 24)}</TableCell>
      <TableCell>{quantity}</TableCell>
      <TableCell>
        <Typography variant="body2">{moment(updatedAt).format('DD/MM/YYYY') || '-'}</Typography>
      </TableCell>
    </>
  );
  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      {renderCells()}
    </TableRow>
  );
}

import Avatar from '@mui/material/Avatar'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import VisibilityIcon from '@mui/icons-material/Visibility'

// ----------------------------------------------------------------------

// type cho row thống kê đánh giá bác sĩ
interface DoctorReviewRow {
  index: number
  doctorId: string
  name: string
  avgRating: number
  reviewCount: number
  avatarUrl?: string | null
}

type Props = {
  row: DoctorReviewRow
  selected: boolean
  onSelectRow: VoidFunction
  onViewRow?: VoidFunction
}

export default function CustomTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow
}: Props) {
  return (
    <TableRow hover selected={selected}>
      <TableCell align="center" padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>
      <TableCell>{row.doctorId}</TableCell>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          src={row.avatarUrl || '/assets/icons/app/avatar-default.svg'}
          alt={row.name}
          sx={{ width: 32, height: 32 }}
        />
        <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
          {row.name}
        </Typography>
      </TableCell>
      <TableCell align="center">{row.avgRating}</TableCell>
      <TableCell align="center">{row.reviewCount}</TableCell>
      <TableCell align="center">
        <IconButton onClick={onViewRow} aria-label="Xem chi tiết">
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

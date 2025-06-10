import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'

// type cho row
export type SpecialtyRow = {
  specialty: string
  specialtyIcon?: string
  visits: number
  revenue: number
  doctorCount: number
  percentChange: number
}

type Props = {
  row: SpecialtyRow
  index: number
}

export default function SpecialtyTableRow({ row, index }: Props) {
  return (
    <TableRow hover>
      <TableCell align="center">{index + 1}</TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {row.specialtyIcon && (
            <Avatar
              src={row.specialtyIcon}
              alt={row.specialty}
              sx={{ width: 32, height: 32 }}
            />
          )}
          <Typography variant="body2" noWrap>
            {row.specialty}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="center">{row.visits}</TableCell>
      <TableCell align="center">{row.revenue.toLocaleString()} VNĐ</TableCell>
      <TableCell align="center">{row.doctorCount}</TableCell>
      <TableCell
        align="center"
        sx={{ color: row.percentChange >= 0 ? 'success.main' : 'error.main' }}
      >
        {row.percentChange > 0 ? '+' : ''}
        {row.percentChange}%
      </TableCell>
    </TableRow>
  )
}

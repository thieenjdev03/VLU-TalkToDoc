import moment from 'moment'

import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableCell from '@mui/material/TableCell'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { IInvoice } from 'src/types/invoice'

// ----------------------------------------------------------------------

type Props = {
  row: IInvoice & { platformRevenue?: number }
}

export default function RevenuePlatformTableRow({ row }: Props) {
  const theme = useTheme()
  const {
    orderId,
    createdAt,
    discount,
    status,
    salaryStatus,
    appointmentInfo
  } = row as any

  // Tính doanh thu nền tảng
  const renderStatus = (statusParams: string) => {
    switch (statusParams) {
      case 'paid':
        return 'Đã thanh toán'
      case 'pending':
        return 'Đang thanh toán'
      case 'overdue':
        return 'Quá hạn'
      case 'canceled':
        return 'Đã hủy'
      case 'completed':
        return 'Đã thanh toán'
      default:
        return 'Chưa xác định'
    }
  }
  const total = appointmentInfo?.payment?.total ?? 0
  const doctorFee = total * 0.9
  const platformRevenue =
    total - doctorFee - (appointmentInfo?.payment?.discount || 0)

  return (
    <TableRow hover>
      <TableCell align="center" padding="checkbox">
        <Checkbox disabled checked={salaryStatus} />
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap>
          {orderId}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap>
          {appointmentInfo?.appointmentId}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap>
          {moment(createdAt).format('DD/MM/YYYY')}
        </Typography>
      </TableCell>
      <TableCell align="center">
        {appointmentInfo?.payment?.total?.toLocaleString() || 0} VNĐ
      </TableCell>
      <TableCell align="center">{doctorFee.toLocaleString()} VNĐ</TableCell>
      <TableCell align="center">
        {appointmentInfo?.payment?.discount?.toLocaleString() || 0} VNĐ
      </TableCell>
      <TableCell
        align="center"
        style={{ fontWeight: 600, color: theme.palette.info.main }}
      >
        {platformRevenue?.toLocaleString() || 0} VNĐ
      </TableCell>
      <TableCell align="center">
        {renderStatus(status?.toLowerCase() || '')}
      </TableCell>
    </TableRow>
  )
}

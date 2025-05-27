import { useState } from 'react'

import {
  Box,
  Table,
  Paper,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography
} from '@mui/material'

import { CaseOffer, CaseMedication } from 'src/types/case'

type PrescriptionViewProps = {
  prescriptions: CaseOffer[]
  doctor_name: string
}

export default function PrescriptionView({
  prescriptions,
  doctor_name
}: PrescriptionViewProps) {
  const [showAll, setShowAll] = useState(false)

  if (!prescriptions?.length) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Đơn thuốc
        </Typography>
        <Typography variant="body2">Chưa có đơn thuốc nào</Typography>
      </Paper>
    )
  }

  const visiblePrescriptions = showAll
    ? prescriptions
    : prescriptions.slice(0, 1)

  // Helper tính tổng tiền tạm tính cho 1 đơn
  const calcTotalPrice = (meds: CaseMedication[]) => {
    if (!Array.isArray(meds)) return 0
    return meds.reduce((sum, med) => {
      const price = med?.price ?? 0
      const quantity = med?.quantity ?? 1
      return (
        sum +
        (Number.isNaN(price) || Number.isNaN(quantity) ? 0 : price * quantity)
      )
    }, 0)
  }

  return (
    <>
      {visiblePrescriptions.map((offer, idx) => {
        const totalPrice = calcTotalPrice(offer.medications)
        return (
          <Paper key={offer._id || idx} elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Đơn thuốc {prescriptions.length > 1 ? `#${idx + 1}` : ''}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Mã đơn: <strong>{offer._id}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Bác sĩ kê đơn: <strong>{doctor_name}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ngày kê:{' '}
              <strong>
                {offer.createdAt
                  ? new Date(offer.createdAt).toLocaleDateString('vi-VN')
                  : '-'}
              </strong>
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tên thuốc</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Liều lượng</TableCell>
                  <TableCell>Cách dùng</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Giá thuốc</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offer.medications?.length ? (
                  offer.medications.map((med, medIdx) => (
                    <TableRow key={med._id || medIdx}>
                      <TableCell>{med.name || 'Không tên thuốc'}</TableCell>
                      <TableCell>{med.quantity || 1}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{med.usage}</TableCell>
                      <TableCell>{med.duration}</TableCell>
                      <TableCell>
                        {med.price
                          ? (med.price * 1000).toLocaleString('vi-VN')
                          : ''}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có thuốc nào trong đơn này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Box mt={2}>
              <Typography variant="subtitle1" color="primary">
                Tạm tính tổng: {(totalPrice * 1000).toLocaleString('vi-VN')} VNĐ
              </Typography>
            </Box>

            {offer.note && (
              <Box mt={2}>
                <Typography variant="subtitle2">Ghi chú:</Typography>
                <Typography variant="body2">{offer.note}</Typography>
              </Box>
            )}
          </Paper>
        )
      })}

      {prescriptions.length > 1 && (
        <Box textAlign="center">
          <Button onClick={() => setShowAll(!showAll)}>
            {showAll
              ? 'Ẩn bớt đơn thuốc'
              : `Xem thêm ${prescriptions.length - 1} đơn`}
          </Button>
        </Box>
      )}
    </>
  )
}

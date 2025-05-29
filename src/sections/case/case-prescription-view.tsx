import { useMemo, useState, useCallback } from 'react'

import {
  Box,
  Grid,
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

  // Helper tính tổng tiền tạm tính cho 1 đơn - wrap trong useCallback
  const calcTotalPrice = useCallback((meds: CaseMedication[]) => {
    if (!Array.isArray(meds)) return 0
    return meds.reduce((sum, med) => {
      const price = med?.price ?? 0
      const quantity = med?.quantity ?? 1
      return (
        sum +
        (Number.isNaN(price) || Number.isNaN(quantity) ? 0 : price * quantity)
      )
    }, 0)
  }, [])

  // Tính tổng tiền cho tất cả đơn thuốc
  const totalAllPrescriptions = useMemo(() => {
    if (!prescriptions?.length) return 0
    return prescriptions.reduce(
      (total, offer) => total + calcTotalPrice(offer.medications),
      0
    )
  }, [prescriptions, calcTotalPrice])

  // Tính tổng số loại thuốc đã kê
  const totalMedicationTypes = useMemo(() => {
    if (!prescriptions?.length) return 0
    const uniqueMedications = new Set()
    prescriptions.forEach(offer => {
      offer.medications?.forEach(med => {
        if (med.medicationId) {
          uniqueMedications.add(med.medicationId)
        }
      })
    })
    return uniqueMedications.size
  }, [prescriptions])

  // Tính tổng số viên thuốc đã kê
  const totalMedicationQuantity = useMemo(() => {
    if (!prescriptions?.length) return 0
    return prescriptions.reduce((total, offer) => {
      const offerTotal =
        offer.medications?.reduce((sum, med) => sum + (med.quantity ?? 1), 0) ??
        0
      return total + offerTotal
    }, 0)
  }, [prescriptions])

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

  return (
    <>
      {/* Thông tin tổng hợp đơn thuốc */}
      <Typography variant="h6" gutterBottom>
        Tổng hợp đơn thuốc
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Tổng số đơn thuốc
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
              {prescriptions.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Tổng tiền các đơn thuốc
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
              {(totalAllPrescriptions * 1000).toLocaleString('vi-VN')} đ
            </Typography>
          </Paper>
        </Grid>
      </Grid>

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
            <Typography variant="body2" sx={{ mb: 1 }}>
              Nhà thuốc: <strong>{offer.pharmacyId?.name || '-'}</strong>
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
                          ? `${(med.price * 1000).toLocaleString('vi-VN')} đ`
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
                Tạm tính tổng: {(totalPrice * 1000).toLocaleString('vi-VN')} đ
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

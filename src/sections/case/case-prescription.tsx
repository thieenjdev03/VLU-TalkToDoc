import { Card, Stack, Divider, Typography, CardContent } from '@mui/material'

import { CaseOffer } from 'src/types/case'

type PrescriptionCardProps = {
  offer: CaseOffer
  idx: number
}

export function PrescriptionCard({ offer, idx }: PrescriptionCardProps) {
  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography fontWeight="bold" fontSize={18} color="primary">
            Đơn thuốc #{idx + 1}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(offer.createdAt).toLocaleString('vi-VN')}
          </Typography>
        </Stack>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="body2" mb={0.5}>
          <b>Bác sĩ kê đơn:</b>{' '}
          {offer.createdBy?.fullName || 'Chưa có thông tin'}
        </Typography>
        {offer.note && (
          <Typography variant="body2" mb={0.5}>
            <b>Ghi chú:</b> {offer.note}
          </Typography>
        )}
        <Typography variant="body2" mt={1} mb={0.5}>
          <b>Danh sách thuốc:</b>
        </Typography>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}
        >
          <thead>
            <tr style={{ background: '#f6f8fa' }}>
              <th style={{ textAlign: 'left', padding: 6 }}>Tên thuốc</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Liều dùng</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Cách dùng</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Thời gian</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Giá thuốc</th>
            </tr>
          </thead>
          <tbody>
            {offer.medications?.map((med, i) => (
              <tr key={med._id || i}>
                <td style={{ padding: 6 }}>{med.name || 'Không tên thuốc'}</td>
                <td style={{ padding: 6 }}>{med.dosage}</td>
                <td style={{ padding: 6 }}>{med.usage}</td>
                <td style={{ padding: 6 }}>{med.duration}</td>
                <td style={{ padding: 6 }}>
                  {med.price
                    ? ((med?.price as number) * 1000).toLocaleString('vi-VN')
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

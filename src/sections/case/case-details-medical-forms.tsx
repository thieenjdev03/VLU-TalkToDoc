import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Kiểu dữ liệu form bệnh án
export type MedicalFormData = {
  patientName?: string
  patientAge?: number
  gender?: string
  address?: string
  phone?: string
  symptoms?: string
  diagnosis?: string
  note?: string
  doctorName?: string
  [key: string]: any
}

function renderMedicalField(label: string, value?: string | number) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', minWidth: 120 }}
      >
        {label}:
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Stack>
  )
}

export default function CaseDetailsMedicalForms({
  medicalFormData
}: {
  medicalFormData: MedicalFormData
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Thông tin bệnh án
      </Typography>
      <Stack spacing={1}>
        {renderMedicalField('Họ tên bệnh nhân', medicalFormData?.patientName)}
        {renderMedicalField('Tuổi', medicalFormData?.patientAge)}
        {renderMedicalField('Giới tính', medicalFormData?.gender)}
        {renderMedicalField('Địa chỉ', medicalFormData?.address)}
        {renderMedicalField('Số điện thoại', medicalFormData?.phone)}
        {renderMedicalField('Triệu chứng', medicalFormData?.symptoms)}
        {renderMedicalField('Chẩn đoán', medicalFormData?.diagnosis)}
        {renderMedicalField('Ghi chú', medicalFormData?.note)}
        {renderMedicalField('Bác sĩ', medicalFormData?.doctorName)}
      </Stack>
      <Divider sx={{ my: 2 }} />
    </Box>
  )
}

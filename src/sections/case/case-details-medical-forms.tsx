import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

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
    <Card sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Thông tin bệnh án
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1}>
        {renderMedicalField('Họ tên bệnh nhân', medicalFormData?.patientName)}
        {renderMedicalField('Tuổi', medicalFormData?.patientAge)}
        {renderMedicalField('Giới tính', medicalFormData?.gender)}
        {renderMedicalField('Địa chỉ', medicalFormData?.address)}
        {renderMedicalField('Số điện thoại', medicalFormData?.phone)}
        <TextField
          label="Triệu chứng"
          defaultValue={medicalFormData?.symptoms}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Chẩn đoán"
          defaultValue={medicalFormData?.diagnosis}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Ghi chú"
          defaultValue={medicalFormData?.note}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 1 }}
        />
      </Stack>
      <Divider sx={{ my: 2 }} />
    </Card>
  )
}

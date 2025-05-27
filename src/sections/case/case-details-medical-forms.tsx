import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import PrescriptionView from './case-prescription-view'

// Kiểu dữ liệu form bệnh án
function renderMedicalField(label: string, value?: string | number) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', minWidth: 120, fontWeight: 'bold' }}
      >
        {label}:
      </Typography>
      <Typography variant="body1">{value || '-'}</Typography>
    </Stack>
  )
}

type PrescriptionFormProps = {
  caseId: string
  medicalForm?: {
    symptoms?: string
    diagnosis?: string
    note?: string
    [key: string]: any
  }
  onSuccess?: () => void
}

export default function CaseDetailsMedicalForms({
  medicalFormData
}: {
  medicalFormData: any
}) {
  const getAge = (birthDate: string | Date) => {
    const today = new Date()
    const dob = new Date(birthDate)
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age -= 1
    }

    return age
  }
  const handleSubmit = () => {
    console.log('handleSubmit')
  }
  console.log('medicalFormData', medicalFormData)
  return (
    <Card sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Thông tin bệnh án
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1}>
        {renderMedicalField(
          'Họ tên bệnh nhân',
          medicalFormData?.appointmentId?.patient?.fullName
        )}
        {renderMedicalField(
          'Tuổi',
          getAge(medicalFormData?.appointmentId?.patient?.birthDate)
        )}
        {renderMedicalField(
          'Giới tính',
          medicalFormData?.appointmentId?.patient?.gender === 'male'
            ? 'Nam'
            : 'Nữ'
        )}
        {renderMedicalField(
          'Địa chỉ',
          medicalFormData?.appointmentId?.patient?.address
        )}
        {renderMedicalField(
          'Số điện thoại',
          medicalFormData?.appointmentId?.patient?.phoneNumber
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Điền thông tin bệnh án:
        </Typography>
        <TextField
          label="Triệu chứng"
          defaultValue={medicalFormData?.symptoms}
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Chẩn đoán"
          defaultValue={medicalFormData?.diagnosis}
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <Divider sx={{ my: 2 }} />
        <PrescriptionView
          prescriptions={medicalFormData.offers || []}
          doctor_name={
            medicalFormData.appointmentId?.doctor?.fullName ||
            'Chưa có thông tin'
          }
        />
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Hoàn Thành Bệnh Án
        </Button>
      </Stack>
      <Divider sx={{ my: 2 }} />
    </Card>
  )
}

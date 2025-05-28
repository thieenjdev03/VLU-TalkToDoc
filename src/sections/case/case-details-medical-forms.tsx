import { useState } from 'react'
import { useSnackbar } from 'notistack'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { endpoints, axiosInstanceV2 } from 'src/utils/axios'

import PrescriptionView from './case-prescription-view'
import CaseDynamicFormView from './case-dynamic-form-view'

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
  medicalFormData,
  formFields
}: {
  medicalFormData: any
  formFields: any[]
}) {
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [symptoms, setSymptoms] = useState(
    medicalFormData?.medicalForm?.symptoms || ''
  )
  const [diagnosis, setDiagnosis] = useState(
    medicalFormData?.medicalForm?.diagnosis || ''
  )
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Cập nhật thông tin bệnh án
      await axiosInstanceV2.post(endpoints.case.createOrUpdate, {
        case_id: medicalFormData._id,
        medical_form: {
          symptoms,
          diagnosis,
          ...medicalFormData?.medicalForm,
          note: ''
        },
        action: 'submit',
        status: 'completed'
      })

      // Cập nhật trạng thái cuộc hẹn thành completed
      if (medicalFormData?.appointmentId?._id) {
        await axiosInstanceV2.patch(
          endpoints.appointment.update(medicalFormData.appointmentId._id),
          {
            status: 'COMPLETED'
          }
        )
      }

      enqueueSnackbar('Đã hoàn thành bệnh án thành công', {
        variant: 'success'
      })
    } catch (error) {
      console.error('Lỗi khi hoàn thành bệnh án:', error)
      enqueueSnackbar('Có lỗi xảy ra khi hoàn thành bệnh án', {
        variant: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
        {/* Dynamic Form từ medicalForm */}
        {formFields.length > 0 && (
          <CaseDynamicFormView
            config={formFields.map((field: any) => ({
              ...field,
              type: field.type as 'text' | 'select' | 'textarea' | 'number'
            }))}
            disabled={userProfile?.role === 'PATIENT'}
            medicalFormData={medicalFormData?.medicalForm || {}}
          />
        )}

        <Typography variant="h6" sx={{ mb: 1 }}>
          Điền thông tin bệnh án:
        </Typography>
        <TextField
          label="Triệu chứng"
          value={medicalFormData?.medicalForm?.symptoms}
          onChange={e => setSymptoms(e.target.value)}
          variant="outlined"
          fullWidth
          disabled={userProfile?.role === 'PATIENT'}
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Chẩn đoán"
          value={medicalFormData?.medicalForm?.diagnosis}
          onChange={e => setDiagnosis(e.target.value)}
          variant="outlined"
          fullWidth
          disabled={userProfile?.role === 'PATIENT'}
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
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Hoàn Thành Bệnh Án'}
        </Button>
      </Stack>
      <Divider sx={{ my: 2 }} />
    </Card>
  )
}

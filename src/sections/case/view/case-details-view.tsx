import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { getCaseDetail } from 'src/api/case'

import { useSettingsContext } from 'src/components/settings'

import { CaseDetails } from 'src/types/case'

import CaseDetailsToolbar from '../case-details-toolbar'
import CaseDetailsHistory from '../case-details-history'
import { PrescriptionModal } from '../case-prescription-form'
import CaseDetailsMedicalForms from '../case-details-medical-forms'

// ----------------------------------------------------------------------

export type CaseSpecialty = {
  _id: string
  name: string
}

export type CaseMedicalForm = {
  symptoms?: string
  questions?: { question: string; answer: string }[]
  note?: string
}

export type CasePatient = {
  _id: string
  fullName: string
  email?: string
  phoneNumber?: string
  address?: string
  [key: string]: any
}

export type CaseDoctor = {
  _id: string
  fullName: string
  [key: string]: any
}

export type CaseAppointment = {
  _id: string
  appointmentId: string
  date: string
  slot: string
  status: string
  doctor: CaseDoctor
  patient: CasePatient
  [key: string]: any
}

export type CaseMedication = {
  medicationId: string
  name: string
  dosage: string
  usage: string
  duration: string
}

export type CaseOffer = {
  createdAt: string
  createdBy: CaseDoctor
  note?: string
  medications: CaseMedication[]
}

export type CaseOfferSummary = {
  date: string
  doctor: string
  summary: string
}

type Props = {
  id: string
}

function getCaseTimeline(caseData: any) {
  const timeline = []

  if (caseData?.createdAt) {
    timeline.push({
      title: 'Tạo lịch hẹn',
      time: new Date(caseData.createdAt)
    })
  }

  if (caseData?.appointmentId?.confirmedAt) {
    timeline.push({
      title: 'Xác nhận lịch hẹn',
      time: new Date(caseData.appointmentId.confirmedAt)
    })
  }

  if (caseData?.appointmentId?.date) {
    timeline.push({
      title: 'Thời gian khám',
      time: new Date(caseData.appointmentId.date)
    })
  }

  if (Array.isArray(caseData?.offers)) {
    caseData.offers.forEach((offer: any, idx: number) => {
      if (offer.createdAt) {
        timeline.push({
          title: `Kê đơn lần ${idx + 1}`,
          time: new Date(offer.createdAt)
        })
      }
    })
  }

  if (caseData?.updatedAt) {
    timeline.push({
      title: 'Cập nhật bệnh án',
      time: new Date(caseData.updatedAt)
    })
  }

  if (
    caseData?.appointmentId?.payment?.status === 'PAID' &&
    caseData?.appointmentId?.updatedAt
  ) {
    timeline.push({
      title: 'Thanh toán',
      time: new Date(caseData.appointmentId.updatedAt)
    })
  }

  // Có thể bổ sung các mốc khác nếu có dữ liệu
  return timeline
}

export default function CaseDetailsView({ id }: Props) {
  const settings = useSettingsContext()
  const [currentCase, setCurrentCase] = useState<CaseDetails | null>(null)
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false)
  const [medicalFormConfig, setMedicalFormConfig] = useState<any[]>([])

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await getCaseDetail(id)
        setCurrentCase(response?.caseDetail || null)
      } catch (error) {
        console.error('Failed to fetch case details:', error)
      }
    }

    fetchCaseDetails()
  }, [id])

  useEffect(() => {
    // Lấy cấu hình form từ localStorage (giống như trong booking-create.tsx)
    const generalSettings = JSON.parse(
      localStorage.getItem('generalSettings') || '{}'
    )
    const formConfig = generalSettings?.general_setting?.form_json || []
    setMedicalFormConfig(formConfig)
  }, [])

  if (!currentCase) return <div>Đang tải...</div>

  const caseData = currentCase.data
  const timeline = getCaseTimeline(caseData)

  // Tìm cấu hình form phù hợp với chuyên khoa của case
  const specialtyId = caseData?.specialty?.id || ''
  const formFields =
    medicalFormConfig?.find((item: any) => item?.specialty_id === specialtyId)
      ?.fields || []
  console.log('caseData', caseData)
  console.log('specialtyId', specialtyId)
  console.log('medicalFormConfig', medicalFormConfig)
  console.log('formFields', formFields)
  // Xử lý các ngày để tránh lỗi undefined
  const orderTime = caseData?.createdAt
    ? new Date(caseData.createdAt)
    : new Date()
  const paymentTime = caseData?.appointmentId?.updatedAt
    ? new Date(caseData.appointmentId.updatedAt)
    : new Date()
  const deliveryTime = caseData?.updatedAt
    ? new Date(caseData.updatedAt)
    : new Date()
  const completionTime = caseData?.updatedAt
    ? new Date(caseData.updatedAt)
    : new Date()

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CaseDetailsToolbar
        currentAppointment={caseData?.appointmentId}
        backLink={paths.dashboard.case.root}
        orderNumber={caseData?.appointmentId?.appointmentId || ''}
        createdAt={
          caseData?.createdAt ? new Date(caseData.createdAt) : new Date()
        }
        status={caseData?.status}
        onChangeStatus={() => {}}
        statusOptions={[
          { value: 'pending', label: 'Chờ xử lý' },
          { value: 'completed', label: 'Hoàn thành' },
          { value: 'cancelled', label: 'Đã hủy' },
          { value: 'refunded', label: 'Hoàn tiền' }
        ]}
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
      />
      <PrescriptionModal
        open={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        caseId={caseData?._id}
      />

      <Grid container spacing={3}>
        {/* Form bệnh án */}
        <Grid item xs={12} md={10}>
          <CaseDetailsMedicalForms
            medicalFormData={caseData || {}}
            formFields={formFields}
          />
        </Grid>

        {/* Lịch sử */}
        <Grid item xs={6} md={2}>
          <CaseDetailsHistory
            history={{
              orderTime,
              paymentTime,
              deliveryTime,
              completionTime,
              timeline
            }}
          />
        </Grid>
      </Grid>
    </Container>
  )
}

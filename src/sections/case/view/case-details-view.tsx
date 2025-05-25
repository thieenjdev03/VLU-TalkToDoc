import axios from 'axios'
import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { useSettingsContext } from 'src/components/settings'

import CaseDetailsToolbar from '../case-details-toolbar'
import CaseDetailsHistory from '../case-details-history'
import CaseDetailsMedicalForms from '../case-details-medical-forms'

// ----------------------------------------------------------------------

// Define the CaseDetails type based on the API response structure
interface CaseDetails {
  _id: string
  patient: string
  specialty: string
  status: string
  isDeleted: boolean
  createdAt: string
  offers: any[]
  updatedAt: string
  appointmentId: {
    _id: string
    appointmentId: string
    patient: {
      _id: string
      username: string
      email: string
      fullName: string
      phoneNumber: string
      birthDate: string
      isActive: boolean
      city: {
        name: string
        code: number
        division_type: string
        codename: string
        phone_code: number
      }
      role: string
      gender: string
      medicalHistory: {
        condition: string
        diagnosisDate: string
        treatment: string
        _id: string
      }[]
      address: string
      appointments: {
        doctorId: string
        date: string
        status: string
        _id: string
      }[]
      id: string
      avatarUrl: string
    }
    doctor: {
      _id: string
      username: string
      email: string
      fullName: string
      phoneNumber: string
      isActive: boolean
      city: string
      role: string
      specialty: string[]
      hospital: string
      experienceYears: number
      licenseNo: string
      rank: string
      position: string
      registrationStatus: string
      availability: any[]
      id: string
      avatarUrl?: string
    }
    specialty: string
    date: string
    slot: string
    timezone: string
    status: string
    payment: {
      platformFee: number
      doctorFee: number
      discount: number
      total: number
      status: string
      paymentMethod: string
      totalFee: number
      billing_status: string
    }
    createdAt: string
    updatedAt: string
    cancelledAt?: string
    reason?: string
  }
  offerSummary: any[]
}

type MedicalFormData = {
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

type Props = {
  taxes: number
  id: string
  shipping: number
  discount: number
  subTotal: number
  totalAmount: number
  items: any[]
  medicalFormData?: MedicalFormData
}

export default function CaseDetailsView({
  id,
  taxes,
  shipping,
  discount,
  subTotal,
  totalAmount,
  items,
  medicalFormData
}: Props) {
  const settings = useSettingsContext()
  const [currentCase, setCurrentCase] = useState<CaseDetails | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/case/${id}`, {
          headers: {
            accept: '*/*',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuaGR1bmc4OCIsInN1YiI6IjY3ZTNmMWZjNmI0ZGJmOTIyOWY2ODdkOCIsInJvbGUiOiJQQVRJRU5UIiwiaWF0IjoxNzQ4MDAzNTk0LCJleHAiOjE3NDgwODk5OTR9.QiNIdt8TQg9RRWbOln3dt1Ux2Q8g9-FNYZ9oq9pasyk'
          }
        })
        setCurrentCase(response.data)
        setStatus(response.data.status)
      } catch (error) {
        console.error('Failed to fetch case details:', error)
      }
    }

    fetchCaseDetails()
  }, [id])

  if (!currentCase) return <div>Đang tải...</div>

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CaseDetailsToolbar
        backLink={paths.dashboard.case.root}
        orderNumber={currentCase.appointmentId.appointmentId}
        createdAt={new Date(currentCase.createdAt)}
        status={status}
        onChangeStatus={setStatus}
        statusOptions={[
          { value: 'pending', label: 'Chờ xử lý' },
          { value: 'completed', label: 'Hoàn thành' },
          { value: 'cancelled', label: 'Đã hủy' },
          { value: 'refunded', label: 'Hoàn tiền' }
        ]}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            <CaseDetailsMedicalForms
              medicalFormData={currentCase.appointmentId.patient}
            />
            <CaseDetailsHistory
              history={{
                orderTime: new Date(currentCase.createdAt),
                paymentTime: new Date(currentCase.appointmentId.date),
                deliveryTime: new Date(currentCase.appointmentId.date),
                completionTime: new Date(currentCase.updatedAt),
                timeline: [
                  {
                    title: 'Tạo lịch hẹn',
                    time: new Date(currentCase.createdAt)
                  },
                  {
                    title: 'Hủy lịch hẹn',
                    time: new Date(
                      currentCase.appointmentId.cancelledAt ||
                        currentCase.updatedAt
                    )
                  }
                ]
              }}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            {/* <CaseDetailsItems
              items={currentCase.offers}
              taxes={0}
              shipping={0}
              discount={currentCase.appointmentId.payment.discount}
              subTotal={currentCase.appointmentId.payment.totalFee}
              totalAmount={currentCase.appointmentId.payment.totalFee}
            /> */}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}

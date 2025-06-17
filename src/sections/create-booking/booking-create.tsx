import { useState, useEffect } from 'react'

import { Button } from '@mui/material'

import { useGetUsers } from 'src/api/user'
import { useBookingStore } from 'src/store/booking'
import { submitCase, getCaseDetail } from 'src/api/case'

import { ISpecialtyItem } from 'src/types/specialties'

import { updateAppointment } from './api'
// ----------------------------------------------------------------------
import DynamicFormMUI from './DynamicFormMUI'
import SelectSpecialty from './select-specialty'
import BookingPayment from './booking-payment-step'
import BookingSelectTime from './booking-select-time'

export type FormValuesProps = {
  patient: any
  doctor: any
  specialty: any
  appointment: any
  appointmentId: string
  medical_form: any
  payment: {
    platformFee: number
    doctorFee: number
    discount: number
    total: number
    paymentMethod: string
  }
}
export default function BookingCreate() {
  const [selected, setSelected] = useState<ISpecialtyItem | null>(null)
  const [currentStep, setCurrentStepState] = useState<string>(
    () => localStorage.getItem('booking_step') || 'select-specialty'
  )
  const [generalSettings, setGeneralSettings] = useState<any>(null)
  const [medicalFormConfig, setMedicalFormConfig] = useState<any>(null)
  const { users: doctors } = useGetUsers({
    typeUser: 'doctor',
    query: '',
    page: 1,
    limit: 99,
    sortField: 'createdAt',
    sortOrder: 'desc'
  })
  const { formData, setFormData, updateFormData, resetFormData } =
    useBookingStore()

  const setCurrentStep = (step: string, back?: boolean) => {
    setCurrentStepState(step)
    localStorage.setItem('booking_step', step)
  }

  useEffect(() => {
    localStorage.setItem('booking_form_data', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('generalSettings') || '{}')
    setGeneralSettings(settings)
    const medicalForm = JSON.parse(
      localStorage.getItem('generalSettings') || '{}'
    )
    setMedicalFormConfig(medicalForm?.general_setting?.form_json)
  }, [])

  const handleSelect = (key: ISpecialtyItem) => {
    setSelected(key)
  }

  const handleSelectCurrentStep = (step: string) => {
    setCurrentStep(step)
  }

  const handleSubmit = async (data: FormValuesProps, step: string) => {
    let updatedData = data

    switch (step) {
      case 'select-specialty': {
        if (data.specialty && !formData.caseDetail?._id) {
          try {
            const res = await submitCase({
              specialty: data.specialty._id,
              action: 'create',
              patient: data.patient
            })
            updatedData = res?.data || data
            if (res?.data) {
              console.log('Updated data in specialty', res?.data)
              updateFormData(res?.data)
            }
          } catch (err) {
            // Xử lý lỗi nếu cần
          }
        }
        break
      }
      case 'medical-form': {
        if (formData?.case_id) {
          try {
            const res = await submitCase({
              case_id: formData.case_id,
              action: 'save',
              patient: data.patient,
              specialty: data.specialty,
              medical_form: data.medical_form
            })
            updatedData = res?.data || data
            if (res?.data) {
              console.log('Updated data in medical-form', res?.data)
              updateFormData(res?.data)
            }
          } catch (err) {
            // Xử lý lỗi nếu cần
          }
        }
        break
      }
      case 'select-time-booking': {
        if (formData.caseDetail?._id) {
          try {
            const res = await submitCase({
              case_id: formData.caseDetail._id,
              action: 'save',
              patient: data.patient,
              appointment: data.appointment,
              doctor: data.doctor?._id
            })
            if (res?.data) {
              console.log('Updated data in select-time-booking', res?.data)
              updatedData = res?.data
              updateFormData(res?.data)
            }
          } catch (err) {
            // Xử lý lỗi nếu cần
          }
        }
        break
      }
      case 'confirm-payment-step': {
        try {
          await updateAppointment({
            appointmentId: data.appointmentId,
            data: {
              payment: data.payment
            }
          })
          const getLastedCaseRes = await getCaseDetail(formData.caseDetail._id)
          if (getLastedCaseRes?.caseDetail?.data) {
            console.log(
              'updated data in confirm-payment-step',
              getLastedCaseRes?.caseDetail?.data
            )
            updatedData = getLastedCaseRes?.caseDetail?.data || data
            updateFormData(getLastedCaseRes?.caseDetail?.data)
          } else {
            updatedData = data
          }
        } catch (err) {
          // Xử lý lỗi nếu cần
        }
        break
      }
      case 'payment-step': {
        // Không làm gì ở bước này
        break
      }
      case 'payment-completed': {
        updatedData = data
        break
      }
      default: {
        // Trường hợp không xác định
        break
      }
    }
    updateFormData(updatedData)
  }

  return (
    <>
      {currentStep === 'select-specialty' && (
        <SelectSpecialty
          handleSelectCurrentStep={handleSelectCurrentStep}
          onSelect={handleSelect}
          setCurrentStep={setCurrentStep}
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'medical-form' && (
        <DynamicFormMUI
          setCurrentStep={setCurrentStep}
          onSelect={handleSelect}
          specialty={selected as ISpecialtyItem}
          config={
            medicalFormConfig
              ?.find((item: any) => item?.specialty_id === selected?.id)
              ?.fields?.map((field: any) => ({
                ...field,
                type: field.type as 'text' | 'select' | 'textarea' | 'number'
              })) || []
          }
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'select-time-booking' && (
        <BookingSelectTime
          doctors={doctors}
          setCurrentStep={step => {
            localStorage.setItem('booking_step', step)
            setCurrentStep(step, true)
          }}
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'confirm-payment-step' && (
        <BookingPayment
          setCurrentStep={setCurrentStep}
          specialty={selected as ISpecialtyItem}
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'payment-completed' && (
        <BookingPaymentCompleted
          setCurrentStep={setCurrentStep}
          handleSubmit={handleSubmit as any}
        />
      )}
    </>
  )
}

function BookingPaymentCompleted({
  setCurrentStep,
  handleSubmit
}: {
  setCurrentStep: any
  handleSubmit: (data: FormValuesProps) => Promise<void>
}) {
  const { resetFormData } = useBookingStore()
  const handleNewBooking = () => {
    setCurrentStep('select-specialty')
    resetFormData()
    localStorage.removeItem('booking_step')
    localStorage.removeItem('booking_form_data')
  }
  const handleGoToDashboard = () => {
    setCurrentStep('select-specialty')
    resetFormData()
    localStorage.removeItem('booking_step')
    localStorage.removeItem('booking_form_data')
    window.location.href = '/dashboard'
  }
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mt-4">
        Thanh toán thành công!
      </h2>
      <p className="text-sm text-gray-600 mt-2 max-w-md">
        Cảm ơn bạn đã đặt lịch khám với TalkToDoc. Email xác nhận lịch hẹn và
        hướng dẫn chi tiết đã được gửi đến bạn. Vui lòng kiểm tra email để biết
        thêm thông tin.
      </p>

      <div className="flex gap-4 mt-8">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleNewBooking()}
        >
          Đặt lịch mới
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleGoToDashboard()}
          href="/dashboard" // hoặc thay bằng route thật của bạn
        >
          Về trang chính
        </Button>
      </div>
    </div>
  )
}

import moment from 'moment'
import { useState, useEffect } from 'react'

import { Button } from '@mui/material'

import { useGetUsers } from 'src/api/user'

import { ISpecialtyItem } from 'src/types/specialties'

// ----------------------------------------------------------------------
import DynamicFormMUI from './DynamicFormMUI'
import SelectSpecialty from './select-specialty'
import BookingPayment from './BookingPaymentStep'
import BookingSelectTime from './BookingSelectTime'
import { createAppointment, updateAppointment } from './api'
import { useSubmitCase, useGetCaseDetail } from 'src/api/case'

export type FormValuesProps = {
  patientObject: any
  doctorObject: any
  specialtyObject: any
  appointment: any
  medicalForm: any
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
  const { submitCase } = useSubmitCase()
  const [generalSettings, setGeneralSettings] = useState<any>(null)
  console.log(generalSettings)
  const [medicalFormConfig, setMedicalFormConfig] = useState<any>(null)
  const { users: doctors } = useGetUsers({
    typeUser: 'doctor',
    query: '',
    page: 1,
    limit: 99,
    sortField: 'createdAt',
    sortOrder: 'desc'
  })

  const [formData, setFormData] = useState<FormValuesProps>({
    patientObject: null,
    doctorObject: null,
    specialtyObject: null,
    appointment: { date: '', slot: '', timezone: '', appointmentId: '' },
    medicalForm: { symptoms: '', pain_level: '' },
    payment: {
      platformFee: 0,
      doctorFee: 0,
      discount: 0,
      total: 0,
      paymentMethod: ''
    }
  })

  const [caseId, setCaseId] = useState('')
  const [appointmentId, setAppointmentId] = useState('')
  const currentCase = JSON.parse(localStorage.getItem('currentCase') || '{}')
  const setCurrentStep = (step: string, back?: boolean) => {
    if (back) {
      setCurrentStepState(step)
      localStorage.setItem('booking_step', step)
    } else {
      setCurrentStepState(step)
      localStorage.setItem('booking_step', step)
    }
  }
  useEffect(() => {
    localStorage.setItem('booking_form_data', JSON.stringify(formData))
    console.log('formData', formData)
  }, [formData])

  useEffect(() => {
    console.log('current step', currentStep)
  }, [currentStep])
  const handleSelect = (key: ISpecialtyItem) => {
    setSelected(key)
  }

  const handleSelectCurrentStep = (step: string) => {
    setCurrentStep(step)
  }
  const handleSubmit = async (data: FormValuesProps, step: string) => {
    switch (step) {
      case 'select-specialty':
        if (data.specialtyObject && !currentCase?._id) {
          const res = await submitCase({
            specialty: data.specialtyObject._id,
            action: 'create',
            patient: data.patientObject._id
          })
          setFormData(res?.data)
          localStorage.setItem('currentCase', JSON.stringify(res?.data))
        }
        break
      case 'medical-form':
        console.log('currentCase', currentCase)
        if (currentCase?._id) {
          const res = await submitCase({
            case_id: currentCase?._id,
            action: 'save',
            patient: data.patient,
            specialty: data.specialty,
            medicalForm: data.medicalForm
          })
          setFormData(res?.data)
          localStorage.setItem('currentCase', JSON.stringify(res?.data))
        }
        break
      case 'select-time-booking':
        console.log('currentCase', currentCase)
        if (currentCase?._id) {
          const res = await submitCase({
            case_id: currentCase?._id,
            action: 'save',
            patient: data.patient,
            appointment: data.appointment
          })
          if (res?.data?._id) {
            setFormData(res?.data)
            localStorage.setItem('currentCase', JSON.stringify(res?.data))
          }
        }
        break
      case 'confirm-payment-step':
        await updateAppointment({
          appointmentId: data.appointment.appointmentId,
          data: {
            payment: data.payment
          }
        })
        const getLastedCaseRes = await useGetCaseDetail(currentCase?._id)
        setFormData(getLastedCaseRes?.caseDetail)
        localStorage.setItem(
          'currentCase',
          JSON.stringify(getLastedCaseRes?.caseDetail)
        )
        break
      case 'payment-step':
        break
      case 'payment-completed':
        setFormData(data)
        break
    }
    setFormData(data)
  }
  useEffect(() => {
    console.log('formData', formData)
  }, [formData])

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('generalSettings') || '{}')
    setGeneralSettings(settings)
    const medicalForm = JSON.parse(
      localStorage.getItem('generalSettings') || '{}'
    )
    setMedicalFormConfig(medicalForm?.general_setting?.form_json)
  }, [])

  return (
    <>
      {currentStep === 'select-specialty' && (
        <SelectSpecialty
          handleSelectCurrentStep={handleSelectCurrentStep}
          onSelect={handleSelect}
          formData={formData}
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
          formData={formData}
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
          formData={formData}
        />
      )}
      {currentStep === 'confirm-payment-step' && (
        <BookingPayment
          setCurrentStep={setCurrentStep}
          specialty={selected as ISpecialtyItem}
          formData={formData}
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'payment-step' && (
        <BookingConfirmPayment
          setCurrentStep={setCurrentStep}
          specialty={selected as ISpecialtyItem}
          formData={formData}
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'payment-completed' && (
        <BookingPaymentCompleted
          setCurrentStep={setCurrentStep}
          formData={formData}
          handleSubmit={handleSubmit as any}
        />
      )}
    </>
  )
}
function BookingConfirmPayment({
  setCurrentStep,
  specialty,
  formData,
  handleSubmit
}: {
  setCurrentStep: any
  specialty: ISpecialtyItem
  formData: FormValuesProps
  handleSubmit: (data: FormValuesProps) => Promise<void>
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: Payment Gateway */}
      <div className="col-span-1 lg:col-span-2 flex justify-between mt-6">
        <Button
          variant="outlined"
          onClick={() => setCurrentStep('select-time-booking', true)}
        >
          Trở về
        </Button>
        <Button
          variant="contained"
          onClick={() => setCurrentStep('payment-completed')}
        >
          Thanh Toán
        </Button>
      </div>
    </div>
  )
}
function BookingPaymentCompleted({
  setCurrentStep,
  formData,
  handleSubmit
}: {
  setCurrentStep: any
  formData: FormValuesProps
  handleSubmit: (data: FormValuesProps) => Promise<void>
}) {
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
          onClick={() => setCurrentStep('select-specialty')}
        >
          Đặt lịch mới
        </Button>
        <Button
          variant="contained"
          color="primary"
          href="/dashboard" // hoặc thay bằng route thật của bạn
        >
          Về trang chính
        </Button>
      </div>
    </div>
  )
}

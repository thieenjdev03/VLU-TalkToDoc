'use client'

import dayjs from 'dayjs'
import { Icon } from '@iconify/react'
import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import Select, { components as selectComponents } from 'react-select'

import { Avatar, Button, Typography } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'

import { getUserById } from 'src/api/user'
import { useBookingStore } from 'src/store/booking'
import { createAppointment } from 'src/api/appointment'

import { IUserItem } from 'src/types/user'

import DoctorModal from '../user/detail-doctor'

type Props = {
  doctors: IUserItem[]
  setCurrentStep: (step: string, back?: boolean) => void
  handleSubmit: (data: any, step: string) => void
}

interface TimeSlot {
  index: number
  timeStart: string
  timeEnd: string
  _id?: string
}

interface AvailabilityItem {
  dayOfWeek: number
  timeSlot: TimeSlot[]
}
const DEFAULT_WORKING_HOURS: TimeSlot[] = [
  { index: 0, timeStart: '08:00', timeEnd: '11:30' },
  { index: 1, timeStart: '13:30', timeEnd: '17:00' }
]

// Trả về mảng giờ mặc định cho tất cả các ngày
const getDefaultSlotsForDay = () => generateTimeSlots(DEFAULT_WORKING_HOURS)
const generateTimeSlots = (timeSlots: TimeSlot[]): string[] => {
  const slots: string[] = []
  const excludeBreakTime = ['12:00', '12:30', '13:00', '13:30']

  timeSlots.forEach(slot => {
    let current = dayjs(`2025-04-08T${slot.timeStart}`)
    const endTime = dayjs(`2025-04-08T${slot.timeEnd}`)

    while (current.isBefore(endTime)) {
      const timeStr = current.format('HH:mm')
      if (!excludeBreakTime.includes(timeStr)) {
        slots.push(timeStr)
      }
      current = current.add(60, 'minute')
    }
  })

  return slots.sort()
}
const renderStars = (rating: number) => {
  const stars = []
  for (let i = 1; i <= 5; i += 1) {
    if (rating >= i) {
      stars.push(<Icon key={i} icon="mdi:star" className="text-yellow-400" />)
    } else if (rating >= i - 0.5) {
      stars.push(
        <Icon key={i} icon="mdi:star-half-full" className="text-yellow-400" />
      )
    } else {
      stars.push(
        <Icon key={i} icon="mdi:star-outline" className="text-yellow-400" />
      )
    }
  }
  return <span className="flex items-start gap-1">{stars}</span>
}
const CustomOption = (props: any) => {
  const { data, innerRef, innerProps } = props
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="p-2 hover:bg-gray-100 flex items-center gap-3"
    >
      <Avatar src={data.avatarUrl} sx={{ width: 36, height: 36 }} />
      <div className="flex flex-col">
        <Typography variant="body1" fontWeight="bold">
          {data.label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.hospital}
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {data.base_price?.toLocaleString()}đ
        </Typography>
      </div>
    </div>
  )
}

const CustomSingleValue = (props: any) => {
  const { data } = props
  console.log('data check', data)
  return (
    <selectComponents.SingleValue {...props}>
      <div className="flex items-center gap-4 p-2 shadow-sm">
        <Avatar src={data.avatarUrl} sx={{ width: 60, height: 60 }} />
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <Typography variant="body1" fontWeight="bold">
              {data.label}
            </Typography>
            {renderStars(data.rating)} {`(${data.ratingDetails?.length || 0})`}
          </div>
          <Typography variant="body2" color="text.secondary">
            {data.hospital}
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {data.base_price?.toLocaleString()}đ / lần khám
          </Typography>
        </div>
      </div>
    </selectComponents.SingleValue>
  )
}

export default function BookingSelectTime({
  doctors,
  setCurrentStep,
  handleSubmit
}: Props) {
  const { formData, updateFormData } = useBookingStore()
  const [selectedDoctor, setSelectedDoctor] = useState<IUserItem | null>(
    doctors[0] || null
  )
  const [doctorAvailability, setDoctorAvailability] = useState<
    AvailabilityItem[]
  >([])
  const { enqueueSnackbar } = useSnackbar()
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const selectedDayOfWeek = selectedDate?.day() ?? 0

  // Lấy id chuyên khoa đã chọn (object hoặc string)
  const selectedSpecialtyId =
    typeof formData?.specialty === 'object'
      ? formData.specialty._id || formData.specialty.id
      : formData?.specialty

  // Lọc bác sĩ theo specialty (hỗ trợ cả mảng id string hoặc object)
  const filteredDoctors = selectedSpecialtyId
    ? doctors.filter(doc => {
        if (!Array.isArray(doc.specialty)) return false
        if (typeof doc.specialty[0] === 'string') {
          return doc.specialty.includes(selectedSpecialtyId)
        }
        if (typeof doc.specialty[0] === 'object') {
          return doc.specialty.some(
            s => s._id === selectedSpecialtyId || s.id === selectedSpecialtyId
          )
        }
        return false
      })
    : doctors

  // Chỉ set doctor khi id thực sự khác hoặc không còn trong danh sách
  useEffect(() => {
    if (filteredDoctors.length) {
      // Nếu chưa chọn bác sĩ, hoặc bác sĩ hiện tại không còn trong danh sách lọc
      if (
        !selectedDoctor ||
        !filteredDoctors.some(doc => doc._id === selectedDoctor._id)
      ) {
        setSelectedDoctor(filteredDoctors[0])
        if (filteredDoctors[0]?._id) {
          fetchDoctorDetails(filteredDoctors[0]._id)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredDoctors])

  // Lấy thông tin chi tiết của bác sĩ khi được chọn
  const fetchDoctorDetails = async (doctorId: string) => {
    try {
      setIsLoading(true)
      const doctorDetails = await getUserById(doctorId, 'doctor')
      if (doctorDetails?.availability) {
        setDoctorAvailability(doctorDetails.availability)
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin bác sĩ:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Lấy các slot time có sẵn cho ngày đã chọn
  const getAvailableSlots = () => {
    if (doctorAvailability.length === 0) {
      // Không có availability => dùng giờ mặc định
      return { slots: getDefaultSlotsForDay(), isDefault: true }
    }

    const daySchedule = doctorAvailability.find(
      day => day.dayOfWeek === selectedDayOfWeek
    )
    if (!daySchedule || !daySchedule.timeSlot.length) {
      // Không có ca nào cho ngày này => dùng giờ mặc định
      return { slots: getDefaultSlotsForDay(), isDefault: true }
    }
    return { slots: generateTimeSlots(daySchedule.timeSlot), isDefault: false }
  }

  const { slots: availableTimeSlots, isDefault } = getAvailableSlots()

  // Reset selected slot when changing date
  useEffect(() => {
    setSelectedSlot(null)
  }, [selectedDate])

  const handleDoctorChange = async (option: any) => {
    const doc = doctors.find(d => d.id === option?.value)
    if (doc) {
      setSelectedDoctor(doc)
      if (doc._id) {
        await fetchDoctorDetails(doc._id)
      }
    }
  }

  const handleCreateAppointment = async () => {
    const res = await createAppointment({
      case_id: formData?._id,
      doctor: selectedDoctor?._id,
      date: selectedDate?.format('YYYY-MM-DD'),
      slot: selectedSlot,
      timezone: 'Asia/Ho_Chi_Minh',
      specialty: formData?.specialty
    })
    return res?._id
  }

  const handleSubmitWithAppointment = async () => {
    try {
      const appointmentId = await handleCreateAppointment()
      if (appointmentId) {
        localStorage.setItem('booking_step', 'confirm-payment-step')
        setCurrentStep('confirm-payment-step', false)
        handleSubmit(
          {
            ...formData,
            doctor: selectedDoctor,
            appointment: appointmentId
          },
          'select-time-booking'
        )
      }
    } catch (error) {
      console.log(error)
      enqueueSnackbar(error?.message, {
        variant: 'error',
        autoHideDuration: 3000
      })
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="bg-white p-6 rounded-xl shadow max-w-screen-lg mx-auto space-y-8">
        <div>
          <Typography variant="h6" gutterBottom>
            Chọn bác sĩ:
          </Typography>
          <Select
            className="w-full"
            options={filteredDoctors.map(doc => ({
              value: doc.id,
              label: doc.fullName,
              avatarUrl: doc.avatarUrl,
              hospital: doc.hospital?.name,
              base_price: doc.rank?.base_price,
              rating: doc.avgScore,
              ratingDetails: doc.ratingDetails
            }))}
            value={
              filteredDoctors.length
                ? {
                    value: selectedDoctor?.id,
                    label: selectedDoctor?.fullName,
                    avatarUrl: selectedDoctor?.avatarUrl,
                    hospital: selectedDoctor?.hospital?.name,
                    base_price: selectedDoctor?.rank?.base_price,
                    rating: selectedDoctor?.avgScore,
                    ratingDetails: selectedDoctor?.ratingDetails
                  }
                : null
            }
            onChange={handleDoctorChange}
            components={{
              Option: CustomOption,
              SingleValue: CustomSingleValue
            }}
            styles={{
              control: base => ({
                ...base,
                borderRadius: '8px',
                padding: '4px',
                borderColor: '#ccc',
                boxShadow: 'none',
                ':hover': { borderColor: '#888' }
              })
            }}
            placeholder="Chọn bác sĩ..."
            isDisabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 justify-center items-center">
            <Typography variant="h6" gutterBottom>
              Chọn ngày khám:
            </Typography>
            <DateCalendar
              value={selectedDate}
              onChange={newDate => {
                setSelectedDate(newDate)
                setSelectedSlot(null)
              }}
              disablePast
              className="w-full max-w-md border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex flex-col gap-2 items-center w-full justify-between">
            <div className="flex flex-col gap-2 items-center w-full">
              <Typography variant="h6" gutterBottom>
                Chọn giờ khám:
              </Typography>
              {isLoading && (
                <Typography variant="body2" color="text.secondary">
                  Đang tải lịch khám...
                </Typography>
              )}
              {!isLoading && availableTimeSlots.length > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {availableTimeSlots.map(slot => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-md border text-sm transition duration-150 ${
                          selectedSlot === slot
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className="mt-1"
                  >
                    {isDefault
                      ? '*Đây là khung giờ làm việc mặc định. Bác sĩ có thể không rảnh vào một số giờ này. Vui lòng chọn và đợi xác nhận.'
                      : '*Các giờ dưới đây là giờ rảnh thực tế do bác sĩ đã đăng ký.'}
                  </Typography>
                </>
              )}
              {!isLoading && availableTimeSlots.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="mt-2"
                >
                  Bác sĩ không có lịch khám vào ngày này.
                </Typography>
              )}
            </div>
            <div className="flex gap-2 justify-between w-full">
              <Button
                variant="outlined"
                onClick={() => {
                  localStorage.setItem('booking_step', 'medical-form')
                  setCurrentStep('medical-form', true)
                }}
                color="primary"
                className="primary-bg text-white"
              >
                Trở về
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitWithAppointment}
                disabled={!selectedSlot || !selectedDate || isLoading}
                color="primary"
                className="primary-bg text-white"
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        </div>

        {openModal && (
          <DoctorModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            doctor={selectedDoctor}
            setCurrentStep={setCurrentStep}
            setOpenModal={setOpenModal}
          />
        )}
      </div>
    </LocalizationProvider>
  )
}

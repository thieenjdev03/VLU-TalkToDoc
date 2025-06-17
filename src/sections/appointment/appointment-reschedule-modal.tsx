'use client'

import dayjs from 'dayjs'
import { useState, useEffect } from 'react'
import { components as selectComponents } from 'react-select'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'
import {
  Dialog,
  Avatar,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'

import { getUserById } from 'src/api/user'

import { IUserItem } from 'src/types/user'

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
      current = current.add(30, 'minute')
    }
  })

  return slots.sort()
}

type Props = {
  open: boolean
  onClose: () => void
  doctors: IUserItem[]
  onConfirm: (payload: {
    doctor: IUserItem | null
    date: string | null
    slot: string | null
  }) => void
  defaultData?: {
    appointmentId: string
    doctor: IUserItem | null
    date: string | null
    slot: string | null
  }
}

const workingHoursByDay: Record<number, { start: string; end: string }> = {
  1: { start: '08:00', end: '17:00' },
  2: { start: '08:00', end: '17:00' },
  3: { start: '08:00', end: '17:00' },
  4: { start: '08:00', end: '17:00' },
  5: { start: '08:00', end: '17:00' },
  6: { start: '09:00', end: '17:00' },
  0: { start: '00:00', end: '00:00' }
}

function CustomOption(props: any) {
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

function CustomSingleValue(props: any) {
  const { data } = props
  return (
    <selectComponents.SingleValue {...props}>
      <div className="flex items-center gap-4 p-2">
        <Avatar src={data.avatarUrl} sx={{ width: 40, height: 40 }} />
        <div className="flex flex-col">
          <Typography variant="body1" fontWeight="bold">
            {data.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.hospital}
          </Typography>
        </div>
      </div>
    </selectComponents.SingleValue>
  )
}

export default function BookingTimeModal({
  open,
  onClose,
  doctors,
  onConfirm,
  defaultData
}: Props) {
  const [selectedDoctor, setSelectedDoctor] = useState<IUserItem | null>(
    defaultData?.doctor || doctors[0] || null
  )
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(
    defaultData?.date ? dayjs(defaultData.date) : dayjs()
  )
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    defaultData?.slot || null
  )
  const [doctorAvailability, setDoctorAvailability] = useState<
    AvailabilityItem[]
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

    const selectedDayOfWeek = selectedDate?.day() ?? 0
    const daySchedule = doctorAvailability.find(
      day => day.dayOfWeek === selectedDayOfWeek
    )
    if (!daySchedule || !daySchedule.timeSlot.length) {
      // Không có ca nào cho ngày này => dùng giờ mặc định
      return { slots: getDefaultSlotsForDay(), isDefault: true }
    }
    return { slots: generateTimeSlots(daySchedule.timeSlot), isDefault: false }
  }

  // Nếu defaultData thay đổi khi open, reset lại state
  useEffect(() => {
    if (open) {
      setSelectedDoctor(defaultData?.doctor || doctors[0] || null)
      setSelectedDate(defaultData?.date ? dayjs(defaultData.date) : dayjs())
      setSelectedSlot(defaultData?.slot || null)

      if (defaultData?.doctor?._id) {
        fetchDoctorDetails(defaultData.doctor._id)
      } else if (doctors[0]?._id) {
        fetchDoctorDetails(doctors[0]._id)
      }
    }
  }, [open, defaultData, doctors])

  // Reset selected slot when changing date
  useEffect(() => {
    setSelectedSlot(null)
  }, [selectedDate])

  const { slots: availableTimeSlots, isDefault } = getAvailableSlots()

  const doctorOptions = doctors.map(doc => ({
    value: doc.id,
    label: doc.fullName,
    avatarUrl: doc.avatarUrl,
    hospital: doc.hospital?.name,
    base_price: doc.rank?.base_price
  }))

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa thời gian khám</DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4">
            <div>
              {/* <Typography variant="subtitle1" gutterBottom>
                Chọn bác sĩ:
              </Typography>
              <Select
                options={doctorOptions}
                value={doctorOptions.find(
                  opt => opt.value === selectedDoctor?.id
                )}
                onChange={option => {
                  const doc = doctors.find(d => d.id === option?.value)
                  if (doc) {
                    setSelectedDoctor(doc)
                    if (doc._id) {
                      fetchDoctorDetails(doc._id)
                    }
                  }
                }}
                components={{
                  Option: CustomOption,
                  SingleValue: CustomSingleValue
                }}
                placeholder="Chọn bác sĩ..."
                isDisabled
              /> */}
            </div>

            <div className="flex flex-col md:flex-row gap-6 reschedule-modal-container">
              <div className="flex-1/2">
                <Typography variant="subtitle1" gutterBottom>
                  Chọn ngày khám:
                </Typography>
                <DateCalendar
                  value={selectedDate}
                  onChange={newDate => {
                    setSelectedDate(newDate)
                    setSelectedSlot(null)
                  }}
                  disablePast
                />
              </div>

              <div className="flex-1/2">
                <Typography variant="subtitle1" gutterBottom>
                  Chọn giờ khám:
                </Typography>
                {isLoading && (
                  <Typography variant="body2" color="text.secondary">
                    Đang tải lịch khám...
                  </Typography>
                )}
                {!isLoading && availableTimeSlots.length > 0 && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-2 border rounded-md text-md transition ${
                            selectedSlot === slot
                              ? 'bg-[#2065D1] text-white'
                              : 'bg-white border-gray-300 hover:#2065D1'
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
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            color={selectedDate && selectedSlot ? 'primary' : 'inherit'}
            disabled={!selectedDate || !selectedSlot || isLoading}
            onClick={() => {
              onConfirm({
                doctor: selectedDoctor,
                date: selectedDate?.format('YYYY-MM-DD') || null,
                slot: selectedSlot
              })
              onClose()
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

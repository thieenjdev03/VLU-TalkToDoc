'use client'

import dayjs from 'dayjs'
import { useState, useEffect } from 'react'
import Select, { components as selectComponents } from 'react-select'

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

import { IUserItem } from 'src/types/user'

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

function generateTimeSlots(start: string, end: string, step = 30): string[] {
  const slots: string[] = []
  let current = dayjs(`2025-04-08T${start}`)
  const endTime = dayjs(`2025-04-08T${end}`)
  const excludeBreakTime = ['12:00', '12:30', '13:00', '13:30']

  while (current.isBefore(endTime)) {
    if (!excludeBreakTime.includes(current.format('HH:mm'))) {
      slots.push(current.format('HH:mm'))
    }
    current = current.add(step, 'minute')
  }

  return slots
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

  // Nếu defaultData thay đổi khi open, reset lại state
  useEffect(() => {
    if (open) {
      setSelectedDoctor(defaultData?.doctor || doctors[0] || null)
      setSelectedDate(defaultData?.date ? dayjs(defaultData.date) : dayjs())
      setSelectedSlot(defaultData?.slot || null)
    }
  }, [open, defaultData, doctors])

  const selectedDayOfWeek = selectedDate?.day() ?? 0
  const workingHours = workingHoursByDay[selectedDayOfWeek]
  const availableSlots = generateTimeSlots(workingHours.start, workingHours.end)

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
              <Typography variant="subtitle1" gutterBottom>
                Chọn bác sĩ:
              </Typography>
              <Select
                options={doctorOptions}
                value={doctorOptions.find(
                  opt => opt.value === selectedDoctor?.id
                )}
                onChange={option => {
                  const doc = doctors.find(d => d.id === option?.value)
                  if (doc) setSelectedDoctor(doc)
                }}
                components={{
                  Option: CustomOption,
                  SingleValue: CustomSingleValue
                }}
                placeholder="Chọn bác sĩ..."
              />
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
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
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
            disabled={!selectedDate || !selectedSlot}
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

import moment from 'moment'
import React, { useState, useEffect } from 'react'

import { Delete } from '@mui/icons-material'
import {
  Tab,
  Box,
  Tabs,
  Stack,
  Paper,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Typography
} from '@mui/material'

import { updateDoctorAvailability } from 'src/api/user'

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

// Interface cho dạng dữ liệu từ API
interface AvailabilityFromAPI {
  dayOfWeek: number
  index: number
  timeStart: string
  timeEnd: string
  _id: string
}

const daysOfWeek = [
  { value: 1, label: 'Thứ Hai' },
  { value: 2, label: 'Thứ Ba' },
  { value: 3, label: 'Thứ Tư' },
  { value: 4, label: 'Thứ Năm' },
  { value: 5, label: 'Thứ Sáu' },
  { value: 6, label: 'Thứ Bảy' },
  { value: 0, label: 'Chủ Nhật' }
]

function generateTimeOptions(start: string, end: string, interval: number) {
  const slots: string[] = []
  const startMoment = moment(start, 'HH:mm')
  const endMoment = moment(end, 'HH:mm')

  while (startMoment.isBefore(endMoment)) {
    slots.push(startMoment.format('HH:mm'))
    startMoment.add(interval, 'minutes')
  }

  return slots
}

const timeOptions = generateTimeOptions('06:00', '22:00', 30)

export default function DoctorAvailabilityTabs() {
  const [availability, setAvailability] = useState<AvailabilityItem[]>([])
  const [currentTab, setCurrentTab] = useState(1)
  const userProfile = localStorage.getItem('userProfile')
  const userProfileData = JSON.parse(userProfile || '{}')
  const accessToken = localStorage.getItem('accessToken')

  // Chuyển đổi dữ liệu từ API sang định dạng của component
  useEffect(() => {
    if (
      userProfileData &&
      userProfileData.availability &&
      Array.isArray(userProfileData.availability)
    ) {
      // Chuyển đổi từ cấu trúc phẳng sang lồng nhau
      const formattedAvailability: AvailabilityItem[] = []

      // Nhóm các slot theo ngày
      const groupedByDay: { [key: number]: TimeSlot[] } = {}

      userProfileData.availability.forEach((slot: AvailabilityFromAPI) => {
        if (!groupedByDay[slot.dayOfWeek]) {
          groupedByDay[slot.dayOfWeek] = []
        }

        groupedByDay[slot.dayOfWeek].push({
          index: slot.index,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
          _id: slot._id
        })
      })

      // Tạo mảng AvailabilityItem
      Object.keys(groupedByDay).forEach(day => {
        formattedAvailability.push({
          dayOfWeek: parseInt(day),
          timeSlot: groupedByDay[parseInt(day)]
        })
      })

      console.log('Dữ liệu đã được định dạng lại:', formattedAvailability)
      setAvailability(formattedAvailability)

      // Nếu có dữ liệu cho ngày hiện tại, hiển thị nó
      const firstDayWithData = formattedAvailability[0]?.dayOfWeek
      if (firstDayWithData !== undefined) {
        setCurrentTab(firstDayWithData)
      }
    }
  }, [userProfileData])

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)

    // Auto-init slot nếu chưa có
    if (!availability.find(a => a.dayOfWeek === newValue)) {
      setAvailability(prev => [
        ...prev,
        {
          dayOfWeek: newValue,
          timeSlot: [{ index: 1, timeStart: '', timeEnd: '' }]
        }
      ])
    }
  }

  const handleUpdateSlot = (
    slotIdx: number,
    key: 'timeStart' | 'timeEnd',
    value: string
  ) => {
    const newArr = [...availability]
    const day = newArr.find(a => a.dayOfWeek === currentTab)
    if (!day) return
    day.timeSlot[slotIdx][key] = value
    setAvailability(newArr)
  }

  const handleAddSlot = () => {
    const newArr = [...availability]
    const day = newArr.find(a => a.dayOfWeek === currentTab)
    if (!day) return
    const lastIndex = day.timeSlot.length
    day.timeSlot.push({ index: lastIndex + 1, timeStart: '', timeEnd: '' })
    setAvailability(newArr)
  }

  const handleRemoveSlot = (slotIdx: number) => {
    const newArr = [...availability]
    const day = newArr.find(a => a.dayOfWeek === currentTab)
    if (!day) return
    day.timeSlot.splice(slotIdx, 1)
    setAvailability(newArr)
  }

  const handleSubmit = async () => {
    try {
      // Chuyển đổi dữ liệu về định dạng API
      const formattedAvailability = availability.flatMap(day =>
        day.timeSlot.map((slot, idx) => ({
          dayOfWeek: day.dayOfWeek,
          index: slot.index || idx + 1,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
          _id: slot._id
        }))
      )

      const response = await updateDoctorAvailability({
        doctorId: userProfileData._id,
        availability: formattedAvailability,
        accessToken: accessToken || ''
      })

      console.log('Cập nhật thành công:', response)
      alert('Đã lưu cấu hình thành công!')
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error)
      alert('Có lỗi xảy ra khi lưu cấu hình!')
    }
  }

  const currentDaySlots =
    availability.find(a => a.dayOfWeek === currentTab)?.timeSlot || []

  return (
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom>
        Thời gian làm việc của bác sĩ
      </Typography>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            mt: 2
          }}
        >
          {daysOfWeek.map(day => (
            <Tab key={day.value} label={day.label} value={day.value} />
          ))}
        </Tabs>
      </Box>

      <Stack
        spacing={2}
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {currentDaySlots.map((slot, idx) => (
          <Stack
            key={slot.index || idx}
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <TextField
              select
              label="Giờ bắt đầu"
              value={slot.timeStart}
              onChange={e => handleUpdateSlot(idx, 'timeStart', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 140 }}
            >
              {timeOptions.map(opt => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Giờ kết thúc"
              value={slot.timeEnd}
              onChange={e => handleUpdateSlot(idx, 'timeEnd', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 140 }}
            >
              {timeOptions.map(opt => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            <IconButton
              onClick={() => handleRemoveSlot(idx)}
              color="error"
              size="small"
            >
              <Delete />
            </IconButton>
          </Stack>
        ))}

        <Button variant="outlined" onClick={handleAddSlot}>
          + Thêm khung giờ
        </Button>
      </Stack>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        color="primary"
        onClick={handleSubmit}
      >
        Lưu cấu hình
      </Button>
    </Paper>
  )
}

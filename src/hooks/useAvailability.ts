import moment from 'moment'
import { useState, useEffect } from 'react'

import { useSnackbar } from 'src/components/snackbar'

export interface TimeSlot {
  index: number
  timeStart: string
  timeEnd: string
  _id?: string
}

export interface AvailabilityItem {
  dayOfWeek: number
  timeSlot: TimeSlot[]
}

export interface DayOfWeek {
  value: number
  label: string
}

export const daysOfWeek: DayOfWeek[] = [
  { value: 1, label: 'Thứ Hai' },
  { value: 2, label: 'Thứ Ba' },
  { value: 3, label: 'Thứ Tư' },
  { value: 4, label: 'Thứ Năm' },
  { value: 5, label: 'Thứ Sáu' },
  { value: 6, label: 'Thứ Bảy' },
  { value: 0, label: 'Chủ Nhật' }
]

export const defaultTimeSlots: TimeSlot[] = [
  { index: 0, timeStart: '08:00', timeEnd: '12:00' }
]

export const useAvailability = (initialData?: any) => {
  const { enqueueSnackbar } = useSnackbar()
  const [availability, setAvailability] = useState<AvailabilityItem[]>([])
  const [currentTab, setCurrentTab] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  // Hàm cập nhật localStorage
  const updateLocalStorage = (newAvailability: AvailabilityItem[]) => {
    try {
      const userProfile = JSON.parse(
        localStorage.getItem('userProfile') || '{}'
      )
      // Chỉ lưu những ngày có time slot
      const formattedAvailability = newAvailability
        .filter(day => day.timeSlot.length > 0)
        .map(day => ({
          dayOfWeek: day.dayOfWeek,
          timeSlot: day.timeSlot.map(slot => ({
            index: slot.index,
            timeStart: slot.timeStart,
            timeEnd: slot.timeEnd
          }))
        }))

      userProfile.availability = formattedAvailability
      localStorage.setItem('userProfile', JSON.stringify(userProfile))
    } catch (error) {
      console.error('Lỗi khi cập nhật localStorage:', error)
    }
  }

  useEffect(() => {
    // Tạo mảng availability với slot trống cho tất cả các ngày
    const defaultAvailability: AvailabilityItem[] = daysOfWeek.map(day => ({
      dayOfWeek: day.value,
      timeSlot: []
    }))

    if (initialData?.availability && Array.isArray(initialData.availability)) {
      // Cập nhật từ data có sẵn
      initialData.availability.forEach((item: AvailabilityItem) => {
        const dayIndex = defaultAvailability.findIndex(
          day => day.dayOfWeek === item.dayOfWeek
        )
        if (dayIndex !== -1 && Array.isArray(item.timeSlot)) {
          defaultAvailability[dayIndex].timeSlot = item.timeSlot.map(slot => ({
            index: typeof slot.index === 'number' ? slot.index : 0,
            timeStart: slot.timeStart || '',
            timeEnd: slot.timeEnd || '',
            _id: slot._id
          }))
        }
      })
    }

    // Sắp xếp theo thứ tự ngày trong tuần bằng cách tạo mảng mới
    const sortedAvailability = [...defaultAvailability].sort((a, b) => {
      const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek
      const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek
      return dayA - dayB
    })

    setAvailability(sortedAvailability)
  }, [initialData?.availability])

  const validateTimeSlot = (
    timeStart: string,
    timeEnd: string,
    currentSlots: TimeSlot[],
    currentIndex: number
  ): boolean => {
    if (!timeStart || !timeEnd) return true

    if (moment(timeStart, 'HH:mm').isSameOrAfter(moment(timeEnd, 'HH:mm'))) {
      enqueueSnackbar('Thời gian kết thúc phải sau thời gian bắt đầu', {
        variant: 'error'
      })
      return false
    }

    const hasOverlap = currentSlots.some((slot, idx) => {
      if (idx === currentIndex || !slot.timeStart || !slot.timeEnd) return false
      const start = moment(slot.timeStart, 'HH:mm')
      const end = moment(slot.timeEnd, 'HH:mm')
      const newStart = moment(timeStart, 'HH:mm')
      const newEnd = moment(timeEnd, 'HH:mm')
      return (
        newStart.isBetween(start, end, undefined, '[]') ||
        newEnd.isBetween(start, end, undefined, '[]') ||
        start.isBetween(newStart, newEnd, undefined, '[]') ||
        end.isBetween(newStart, newEnd, undefined, '[]')
      )
    })

    if (hasOverlap) {
      enqueueSnackbar('Thời gian này đã trùng với một khung giờ khác', {
        variant: 'error'
      })
      return false
    }

    return true
  }

  const handleUpdateSlot = (
    slotIdx: number,
    key: 'timeStart' | 'timeEnd',
    value: string
  ) => {
    setAvailability(prev => {
      const newArr = [...prev]
      const day = newArr.find(a => a.dayOfWeek === currentTab)
      if (!day) return prev

      const slot = day.timeSlot[slotIdx]
      const newTimeStart = key === 'timeStart' ? value : slot.timeStart
      const newTimeEnd = key === 'timeEnd' ? value : slot.timeEnd

      if (!validateTimeSlot(newTimeStart, newTimeEnd, day.timeSlot, slotIdx)) {
        return prev
      }

      day.timeSlot[slotIdx][key] = value
      updateLocalStorage(newArr)
      return newArr
    })
  }

  const handleAddSlot = () => {
    setAvailability(prev => {
      const newArr = [...prev]
      const day = newArr.find(a => a.dayOfWeek === currentTab)
      if (!day) return prev

      const lastIndex =
        day.timeSlot.length > 0
          ? Math.max(...day.timeSlot.map(slot => slot.index))
          : -1

      day.timeSlot.push({
        index: lastIndex + 1,
        timeStart: '',
        timeEnd: ''
      })
      updateLocalStorage(newArr)
      return newArr
    })
  }

  const handleRemoveSlot = (slotIdx: number) => {
    setAvailability(prev => {
      const newArr = [...prev]
      const day = newArr.find(a => a.dayOfWeek === currentTab)
      if (!day) return prev

      day.timeSlot.splice(slotIdx, 1)
      updateLocalStorage(newArr)
      return newArr
    })
  }

  const validateTimeSlots = () =>
    availability.every(day => {
      if (day.timeSlot.length === 0) return true

      const hasInvalidSlot = day.timeSlot.some(
        slot => !slot.timeStart || !slot.timeEnd
      )
      if (hasInvalidSlot) {
        const dayLabel = daysOfWeek.find(d => d.value === day.dayOfWeek)?.label
        enqueueSnackbar(`${dayLabel} có khung giờ chưa được điền đầy đủ`, {
          variant: 'error'
        })
        return false
      }
      return true
    })

  const formatAvailabilityForAPI = () =>
    availability
      .filter(day => day.timeSlot.length > 0)
      .map(day => ({
        dayOfWeek: day.dayOfWeek,
        timeSlot: day.timeSlot.map(slot => ({
          index: slot.index,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
          _id: slot._id
        }))
      }))

  return {
    availability,
    currentTab,
    loading,
    setLoading,
    setCurrentTab,
    handleUpdateSlot,
    handleAddSlot,
    handleRemoveSlot,
    validateTimeSlots,
    formatAvailabilityForAPI
  }
}

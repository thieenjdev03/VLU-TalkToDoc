import React from 'react'
import moment from 'moment'

import { Delete } from '@mui/icons-material'
import {
  Tab,
  Box,
  Tabs,
  Stack,
  Paper,
  Alert,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material'

import { daysOfWeek, useAvailability } from 'src/hooks/useAvailability'

import { updateDoctorAvailability } from 'src/api/user'

import { useSnackbar } from 'src/components/snackbar'

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

const defaultTimeSlots = [
  { index: 1, timeStart: '08:00', timeEnd: '12:00' },
  { index: 2, timeStart: '13:30', timeEnd: '17:30' }
]

export default function DoctorAvailabilityTabs() {
  const { enqueueSnackbar } = useSnackbar()
  const userProfile = localStorage.getItem('userProfile')
  const userProfileData = JSON.parse(userProfile || '{}')
  const accessToken = localStorage.getItem('accessToken')

  const {
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
  } = useAvailability(userProfileData)

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
    console.log('currentTab', currentTab)
  }

  const handleSubmit = async () => {
    if (!validateTimeSlots()) return

    try {
      setLoading(true)
      const formattedAvailability = formatAvailabilityForAPI()

      const response = await updateDoctorAvailability({
        doctorId: userProfileData._id,
        availability: formattedAvailability,
        accessToken: accessToken || ''
      })

      if (response) {
        enqueueSnackbar('Cập nhật thời gian làm việc thành công', {
          variant: 'success'
        })
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error)
      enqueueSnackbar('Có lỗi xảy ra khi cập nhật thời gian làm việc', {
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const currentDaySlots =
    availability.find(a => a.dayOfWeek === currentTab)?.timeSlot || []

  return (
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom>
        Thời gian làm việc của bác sĩ
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Vui lòng cấu hình thời gian làm việc cho từng ngày trong tuần. Mỗi ngày
        phải có ít nhất một khung giờ làm việc.
      </Alert>

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
            mt: 2,
            '& .MuiTabs-flexContainer': {
              gap: 1
            }
          }}
        >
          {daysOfWeek
            .slice()
            .sort((a, b) => {
              const dayA = a.value === 0 ? 7 : a.value
              const dayB = b.value === 0 ? 7 : b.value
              return dayA - dayB
            })
            .map(day => (
              <Tab
                key={day.value}
                label={day.label}
                value={day.value}
                sx={{
                  minWidth: 100,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }
                }}
              />
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
            sx={{
              p: 2,
              borderRadius: 1,
              width: '100%',
              maxWidth: 500,
              justifyContent: 'center'
            }}
          >
            <TextField
              select
              label="Giờ bắt đầu"
              value={slot.timeStart}
              onChange={e => handleUpdateSlot(idx, 'timeStart', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 140 }}
              error={!slot.timeStart}
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
              error={!slot.timeEnd}
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
              sx={{
                '&:hover': {
                  bgcolor: 'error.lighter'
                }
              }}
            >
              <Delete />
            </IconButton>
          </Stack>
        ))}

        <Button
          variant="outlined"
          onClick={handleAddSlot}
          startIcon={<span>+</span>}
          sx={{ width: 'fit-content' }}
        >
          Thêm khung giờ
        </Button>
      </Stack>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
        </Button>
      </Box>
    </Paper>
  )
}

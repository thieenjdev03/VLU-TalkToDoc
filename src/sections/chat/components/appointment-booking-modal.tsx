import React, { useState } from 'react'
import Swal from 'sweetalert2'
import {
  AccessTime,
  CalendarToday,
  Close as CloseIcon,
  LocalHospital,
  Person,
  Star
} from '@mui/icons-material'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography
} from '@mui/material'

import { AppointmentSuggestion, Doctor } from 'src/types/chat'

interface AppointmentBookingModalProps {
  open: boolean
  onClose: () => void
  data: AppointmentSuggestion
  onConfirmBooking?: (bookingData: {
    doctorId: string
    timeSlot: string
    date: string
    totalPrice: number
  }) => void
  // If true, hide long descriptive texts; chatbot message will carry explanations
  suppressTexts?: boolean
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  open,
  onClose,
  data,
  onConfirmBooking,
  suppressTexts = true
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(
    (data.availableDoctors?.[0] || data.recommendedDoctors?.[0]) || null
  )
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: string
    time: string
    price: number
  } | null>(null)

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setSelectedTimeSlot(null) // Reset time slot when doctor changes
  }

  const handleTimeSlotSelect = (date: string, time: string, price: number) => {
    setSelectedTimeSlot({ date, time, price })
  }

  const handleConfirmBooking = () => {
    if (selectedDoctor && selectedTimeSlot) {
      onConfirmBooking?.({
        doctorId: selectedDoctor.doctorId,
        timeSlot: selectedTimeSlot.time,
        date: selectedTimeSlot.date,
        totalPrice: data.pricing?.total || selectedTimeSlot.price
      })
      Swal.fire({
        title: 'Đặt lịch thành công!',
        text: 'Bạn đã đặt lịch khám với bác sĩ thành công. Vui lòng kiểm tra lịch sử đặt lịch để xem chi tiết.',
        icon: 'success',
        confirmButtonText: 'Đóng',
        customClass: {
          popup: 'swal2-ttd-popup',
          title: 'swal2-ttd-title',
          confirmButton: 'swal2-ttd-confirm'
        },
        buttonsStyling: true,
        confirmButtonColor: '#16a34a', // Tailwind success.600
      })
      onClose()
    }
  }

  const formatCurrency = (amount: number) => `${amount?.toLocaleString('vi-VN') || '0'} VNĐ`

  const getUrgencySeverity = () => {
    if (data.urgency === 'emergency') return 'error' as const
    if (data.urgency === 'urgent') return 'warning' as const
    return 'success' as const
  }

  const getUrgencyText = () => {
    if (data.urgency === 'emergency' || data.urgency === 'urgent') return 'Khẩn cấp'
    return 'Bình thường'
  }

  const getAvailableTimeSlots = () => {
    const timeSlots = data.suggestedTimeSlots || data.availableSlots || []
    return timeSlots.filter(daySlots => 
      daySlots.slots.some(slot => slot.available)
    )
  }

  // Get doctors to display (support both availableDoctors and recommendedDoctors)
  const doctorsToDisplay = data.availableDoctors || data.recommendedDoctors || []

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: { 
          minHeight: { xs: '100vh', sm: '80vh' },
          m: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Đặt lịch khám bệnh
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
          {/* Urgency Alert */}
          {!suppressTexts && (
            <Alert severity={getUrgencySeverity()}>
              <Typography variant="subtitle2">{getUrgencyText()}</Typography>
              <Typography variant="body2">{data.reason}</Typography>
            </Alert>
          )}

          {/* Doctor Selection */}
          {doctorsToDisplay.length > 0 && (
            <Box>
              {!suppressTexts && (
                <Typography variant="h6" sx={{ mb: 2 }}>
                  1. Chọn bác sĩ
                </Typography>
              )}
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doctor = doctorsToDisplay.find((d) => d.id === e.target.value)
                    if (doctor) handleDoctorSelect(doctor)
                  }}
                >
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    {doctorsToDisplay.map((doctor) => {
                      const isSelected = selectedDoctor?.id === doctor.id
                      return (
                        <Grid item xs={12} sm={12} md={12} key={doctor.id}>
                          <Card
                            sx={{
                              position: 'relative',
                              border: isSelected ? '2px solid' : '1px solid',
                              borderColor: isSelected ? 'primary.main' : 'grey.300',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: (theme) => theme.shadows[3]
                              },
                              '&::after': isSelected
                                ? {
                                    content: '""',
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main'
                                  }
                                : undefined
                            }}
                            onClick={() => handleDoctorSelect(doctor)}
                          >
                            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                              <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                                spacing={{ xs: 1.5, sm: 2 }}
                              >
                                <FormControlLabel 
                                  value={doctor.id} 
                                  control={<Radio size="small" />} 
                                  label="" 
                                  sx={{ m: 0, alignSelf: 'flex-start' }} 
                                />
                                <Avatar sx={{ 
                                  bgcolor: 'primary.main', 
                                  width: { xs: 48, sm: 56 }, 
                                  height: { xs: 48, sm: 56 },
                                  alignSelf: { xs: 'center', sm: 'flex-start' }
                                }}>
                                  <Person fontSize="medium" />
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
                                  <Stack 
                                    direction={{ xs: 'column', sm: 'row' }} 
                                    alignItems={{ xs: 'flex-start', sm: 'center' }} 
                                    spacing={1} 
                                    sx={{ mb: 0.5 }}
                                  >
                                    <Typography 
                                      variant="subtitle1" 
                                      sx={{ 
                                        fontWeight: 'bold', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis',
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                      }}
                                    >
                                      {doctor?.name || doctor?.fullName || 'Chưa xác định'}
                                    </Typography>
                                    {doctor.position && (
                                      <Chip 
                                        size="small" 
                                        label={doctor.position} 
                                        variant="outlined"
                                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                      />
                                    )}
                                  </Stack>
                                  <Stack 
                                    direction={{ xs: 'column', sm: 'row' }} 
                                    spacing={1} 
                                    sx={{ mb: 0.75 }}
                                  >
                                    <Chip 
                                      icon={<Star />} 
                                      label={doctor.rating || 'N/A'} 
                                      color="warning" 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    />
                                    {doctor.nextAvailableSlot && (
                                      <Chip 
                                        icon={<AccessTime />} 
                                        label={`Slot: ${doctor.nextAvailableSlot}`} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                      />
                                    )}
                                  </Stack>
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                  >
                                    {doctor.experienceYears || 0} năm kinh nghiệm
                                  </Typography>
                                </Box>
                                <Stack 
                                  alignItems={{ xs: 'flex-start', sm: 'flex-end' }} 
                                  spacing={0.5} 
                                  sx={{ 
                                    minWidth: { xs: 'auto', sm: 90 },
                                    width: { xs: '100%', sm: 'auto' }
                                  }}
                                >
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                  >
                                    Phí dự kiến
                                  </Typography>
                                  <Typography 
                                    variant="subtitle2" 
                                    color="success.main" 
                                    sx={{ 
                                      textAlign: 'right',
                                      fontWeight: 'bold',
                                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                    }}
                                  >
                                    {formatCurrency(data.pricing?.doctorFee || 0)}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    })}
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {/* Time Slot Selection */}
          {getAvailableTimeSlots().length > 0 && (
            <Box>
              {!suppressTexts && (
                <Typography variant="h6" sx={{ mb: 2 }}>
                  2. Chọn thời gian
                </Typography>
              )}
              <Stack spacing={2}>
                {getAvailableTimeSlots().map((daySlots, dayIndex) => (
                  <Paper key={dayIndex} elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {new Date(daySlots.date).toLocaleDateString('vi-VN')} - {daySlots.dayOfWeek}
                    </Typography>
                    <Grid container spacing={{ xs: 0.5, sm: 1 }}>
                      {daySlots.slots
                        .filter(slot => slot.available)
                        .map((slot, slotIndex) => (
                        <Grid item xs={6} sm={4} md={3} key={slotIndex}>
                          <Card
                            sx={{
                              border: selectedTimeSlot?.date === daySlots.date && selectedTimeSlot?.time === slot.time 
                                ? '2px solid' 
                                : '1px solid',
                              borderColor: selectedTimeSlot?.date === daySlots.date && selectedTimeSlot?.time === slot.time 
                                ? 'primary.main' 
                                : 'grey.300',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)'
                              }
                            }}
                            onClick={() => handleTimeSlotSelect(daySlots.date, slot.time, slot.price)}
                          >
                            <CardContent sx={{ 
                              p: { xs: 1, sm: 1.5, md: 2 }, 
                              textAlign: 'center',
                              minHeight: { xs: 80, sm: 90 }
                            }}>
                              <Stack 
                                direction="row" 
                                alignItems="center" 
                                justifyContent="center" 
                                spacing={0.5} 
                                sx={{ mb: 0.5 }}
                              >
                                <AccessTime fontSize="small" />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                  }}
                                >
                                  {slot.time}
                                </Typography>
                              </Stack>
                              <Typography 
                                variant="caption" 
                                color="success.main" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              >
                                {formatCurrency(slot.price)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Pricing Summary */}
          {data.pricing && (
            <Box>
              {!suppressTexts && (
                <Typography variant="h6" sx={{ mb: 2 }}>
                  3. Tóm tắt chi phí
                </Typography>
              )}
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'success.50' }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Phí bác sĩ:</Typography>
                    <Typography variant="body2">{formatCurrency(data.pricing.doctorFee)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Phí nền tảng:</Typography>
                    <Typography variant="body2">{formatCurrency(data.pricing.platformFee)}</Typography>
                  </Stack>
                  {data.pricing.discount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="success.main">Giảm giá:</Typography>
                      <Typography variant="body2" color="success.main">
                        -{formatCurrency(data.pricing.discount)}
                      </Typography>
                    </Stack>
                  )}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng cộng:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {formatCurrency(data.pricing.total)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Booking Information */}
          {data.bookingInfo && !suppressTexts && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                4. Thông tin đặt lịch
              </Typography>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.50' }}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTime fontSize="small" />
                    <Typography variant="body2">
                      <strong>Đặt trước tối thiểu:</strong> {data.bookingInfo.minAdvanceBooking}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">
                      <strong>Đặt trước tối đa:</strong> {data.bookingInfo.maxAdvanceBooking}
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    <strong>Chính sách hủy:</strong> {data.bookingInfo.cancellationPolicy}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Chính sách đổi lịch:</strong> {data.bookingInfo.reschedulePolicy}
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Selection Summary */}
          {(selectedDoctor || selectedTimeSlot) && !suppressTexts && (
            <Alert severity="info">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Tóm tắt lựa chọn:
              </Typography>
              {selectedDoctor && (
                <Typography variant="body2">
                  <strong>Bác sĩ:</strong> {selectedDoctor.name}
                </Typography>
              )}
              {selectedTimeSlot && (
                <Typography variant="body2">
                  <strong>Thời gian:</strong> {new Date(selectedTimeSlot.date).toLocaleDateString('vi-VN')} - {selectedTimeSlot.time}
                </Typography>
              )}
              {selectedTimeSlot && (
                <Typography variant="body2">
                  <strong>Chi phí:</strong> {formatCurrency(selectedTimeSlot.price)}
                </Typography>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          size="large"
          fullWidth
          sx={{ 
            display: { xs: 'block', sm: 'none' }
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmBooking}
          disabled={!selectedDoctor || !selectedTimeSlot}
          startIcon={<LocalHospital />}
          size="large"
          fullWidth
          sx={{ 
            display: { xs: 'block', sm: 'none' }
          }}
        >
          Xác nhận đặt lịch
        </Button>
        {/* Desktop buttons */}
        <Button 
          onClick={onClose} 
          color="inherit"
          size="medium"
          sx={{ 
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmBooking}
          disabled={!selectedDoctor || !selectedTimeSlot}
          startIcon={<LocalHospital />}
          size="medium"
          sx={{ 
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Xác nhận đặt lịch
        </Button>
      </DialogActions>
    </Dialog>
  )
}

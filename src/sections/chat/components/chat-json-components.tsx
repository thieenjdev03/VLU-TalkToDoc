import React, { useMemo, useState, useEffect } from 'react';

import {
  Box,
  Card,
  Chip,
  Grid,
  List,
  Alert,
  Paper,
  Stack,
  Avatar,
  Button,
  Divider,
  ListItem,
  Typography,
  CardContent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Email,
  Phone,
  Person,
  Warning,
  Schedule,
  Emergency,
  AccessTime,
  LocationOn,
  Psychology,
  CheckCircle,
  CalendarToday,
  LocalHospital,
  MedicalServices,
} from '@mui/icons-material';

import { getAllDoctors } from 'src/api/chat';

import {
  Doctor,
  Pricing,
  BookingInfo,
  GeneralInfo,
  PatientInfo,
  ChatJsonData,
  AppointmentInfo,
  SymptomAnalysis,
  SuggestedTimeSlots,
  FollowUpAppointment,
  AppointmentSuggestion,
} from 'src/types/chat';

import { SafeRender } from './safe-render';
import { AppointmentBookingModal } from './appointment-booking-modal';

// Helper functions for specialty data handling
const getSpecialtyName = (spec: any): string => {
  if (typeof spec === 'string') {
    return spec;
  }
  
  // Handle backend specialty structure
  if (spec?.id?.name) {
    return spec.id.name;
  }
  
  // Handle simple specialty structure
  if (spec?.name) {
    return spec.name;
  }
  
  return 'Chuyên khoa';
};

const getSpecialtyDescription = (spec: any): string => {
  if (typeof spec === 'string') {
    return '';
  }
  
  // Handle backend specialty structure
  if (spec?.id?.description) {
    return spec.id.description;
  }
  
  // Handle simple specialty structure
  if (spec?.description) {
    return spec.description;
  }
  
  return '';
};

const getSpecialtyId = (spec: any): string => {
  if (typeof spec === 'string') {
    return spec;
  }
  
  // Handle backend specialty structure
  if (spec?.id?._id || spec?.id?.id) {
    return spec.id._id || spec.id.id;
  }
  
  // Handle simple specialty structure
  if (spec?.id) {
    return spec.id;
  }
  
  return '';
};

// Helper functions for safe data access
const safeGetPaymentInfo = (payment: any) => {
  try {
    return {
      doctorFee: payment?.doctorFee || 0,
      platformFee: payment?.platformFee || 0,
      discount: payment?.discount || 0,
      total: payment?.total || 0,
      status: payment?.status || 'UNKNOWN',
      paymentMethod: payment?.paymentMethod || '',
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error accessing payment info:', error);
    return {
      doctorFee: 0,
      platformFee: 0,
      discount: 0,
      total: 0,
      status: 'UNKNOWN',
      paymentMethod: '',
    };
  }
};

const safeFormatCurrency = (amount: number | undefined | null): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return (amount || 0).toLocaleString('vi-VN') || '0';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error formatting currency:', error);
    return '0';
  }
};

const safeGetDoctorName = (doctorInfo: any, fallback = 'Chưa xác định'): string => {
  try {
    // Handle new doctor structure with fullName
    if (doctorInfo?.fullName) {
      return doctorInfo.fullName;
    }
    // Handle old structure with name
    if (doctorInfo?.name) {
      return doctorInfo.name;
    }
    return fallback;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error accessing doctor name:', error);
    return fallback;
  }
};
const handleRenderStatus = (status: string): string => {
  switch (status) {
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'COMPLETED':
      return 'Hoàn thành';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
};
// Appointment Info Component
export const AppointmentInfoCard: React.FC<{ data: AppointmentInfo }> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle />;
      case 'PENDING':
        return <Schedule />;
      case 'COMPLETED':
        return <CheckCircle />;
      case 'CANCELLED':
        return <Warning />;
      default:
        return <Schedule />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isAppointmentOld = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  };

  return (
    <SafeRender errorMessage="Không thể hiển thị thông tin lịch hẹn">
      <Card
        sx={{
      mb: 2, 
      border: '1px solid', 
      borderColor: 'primary.main',
      borderRadius: 2,
          overflow: 'hidden',
        }}
      >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <CalendarToday color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" color="primary" fontWeight={600}>
            Thông tin lịch hẹn
          </Typography>
        </Stack>

        {data.hasAppointment ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tổng số lịch hẹn: {data.totalAppointments}
              </Typography>
            </Box>

            {data.nextAppointment && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                    bgcolor: isAppointmentOld(data.nextAppointment.date)
                      ? 'warning.50'
                      : 'primary.50',
                  border: '1px solid',
                    borderColor: isAppointmentOld(data.nextAppointment.date)
                      ? 'warning.200'
                      : 'primary.200',
                  borderRadius: 2,
                    position: 'relative',
                }}
              >
                {isAppointmentOld(data.nextAppointment.date) && (
                  <Chip
                    label="Lịch hẹn cũ"
                    color="warning"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                        fontWeight: 600,
                    }}
                  />
                )}
                
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                      {isAppointmentOld(data.nextAppointment.date)
                        ? 'Lịch hẹn gần nhất'
                        : 'Lịch hẹn sắp tới'}
                  </Typography>
                  {getStatusIcon(data.nextAppointment.status)}
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday 
                          fontSize="small" 
                            color={
                              isAppointmentOld(data.nextAppointment.date)
                                ? 'warning'
                                : 'primary'
                            }
                        />
                        <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem' }}
                            >
                            Ngày
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {formatDate(data.nextAppointment.date)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime 
                          fontSize="small" 
                            color={
                              isAppointmentOld(data.nextAppointment.date)
                                ? 'warning'
                                : 'primary'
                            }
                        />
                        <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem' }}
                            >
                            Giờ
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {(data.nextAppointment as any).time || data.nextAppointment.slot}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person 
                          fontSize="small" 
                            color={
                              isAppointmentOld(data.nextAppointment.date)
                                ? 'warning'
                                : 'primary'
                            }
                        />
                        <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem' }}
                            >
                            Bác sĩ
                          </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {safeGetDoctorName(data.nextAppointment.doctor)}
                            </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(data.nextAppointment.status)}
                        <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem' }}
                            >
                            Trạng thái
                          </Typography>
                          <Chip
                            label={getStatusText(data.nextAppointment.status)}
                            color={getStatusColor(data.nextAppointment.status) as any}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                {data.nextAppointment.reason && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                      Lý do khám
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {data.nextAppointment.reason}
                    </Typography>
                  </Box>
                )}

                  {data.nextAppointment.doctorNote && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Ghi chú bác sĩ
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {data.nextAppointment.doctorNote}
                      </Typography>
                    </Box>
                  )}

                  {/* Payment Information */}
                  {(() => {
                    try {
                      const paymentInfo = safeGetPaymentInfo(data.nextAppointment.payment);
                      return (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem', mb: 1 }}
                          >
                            Thông tin thanh toán
                          </Typography>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Phí bác sĩ:</Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {safeFormatCurrency(paymentInfo.doctorFee)} VNĐ
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Phí nền tảng:</Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {safeFormatCurrency(paymentInfo.platformFee)} VNĐ
                              </Typography>
                            </Stack>
                            {paymentInfo.discount > 0 && (
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="success.main">
                                  Giảm giá:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="success.main"
                                  fontWeight={500}
                                >
                                  -{safeFormatCurrency(paymentInfo.discount)} VNĐ
                                </Typography>
                              </Stack>
                            )}
                            <Divider />
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="subtitle2" fontWeight="bold">
                                Tổng cộng:
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                color="success.main"
                              >
                                {safeFormatCurrency(paymentInfo.total)} VNĐ
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Trạng thái:</Typography>
                              <Chip
                                label={paymentInfo.status || 'Chưa xác định'}
                                color={paymentInfo.status === 'PAID' ? 'success' : 'warning'}
                                size="small"
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    } catch (error) {
                      // eslint-disable-next-line no-console
                      console.warn('Error rendering payment info:', error);
                      return (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                          <Typography variant="body2" color="error.main">
                            Không thể hiển thị thông tin thanh toán
                          </Typography>
                        </Box>
                      );
                    }
                  })()}

                {isAppointmentOld(data.nextAppointment.date) && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Lưu ý:</strong> Đây là lịch hẹn cũ. Bạn có muốn đặt lịch hẹn mới không?
                    </Typography>
                  </Alert>
                )}
              </Paper>
            )}

            {data?.recentAppointments?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Lịch hẹn gần đây
                </Typography>
                <List dense>
                  {data?.recentAppointments?.slice(0, 5).map((appointment, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CalendarToday fontSize="small" />
                      </ListItemIcon>
                         <ListItemText
                           primary={`${new Date(appointment.date).toLocaleDateString(
                             'vi-VN'
                           )} - ${appointment.slot}`}
                           secondary={
                             <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                               <Typography variant="caption" color="text.secondary">
                                 {safeGetDoctorName(appointment.doctor)}
                               </Typography>
                               <Chip
                                 label={handleRenderStatus(appointment.status)}
                                 color={getStatusColor(appointment.status) as any}
                                 size="small"
                               />
                             </Stack>
                           }
                         />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body1">
              Bạn chưa có lịch hẹn nào. Hãy đặt lịch khám để được chăm sóc sức khỏe tốt nhất.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
    </SafeRender>
  );
};

// Doctor Card Component
const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => (
  <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar sx={{ bgcolor: 'primary.main' }}>
        <Person />
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {doctor.name || doctor.fullName || 'Chưa xác định'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {doctor.position || 'Bác sĩ'} • {doctor.experienceYears || 0} năm kinh nghiệm
        </Typography>
        
        {/* Specialty Information */}
        {doctor.specialty && doctor.specialty.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, mb: 0.5 }} flexWrap="wrap">
            {doctor.specialty.map((spec, index) => (
              <Chip
                // eslint-disable-next-line react/no-array-index-key
                key={getSpecialtyId(spec) || index}
                label={getSpecialtyName(spec)}
                size="small"
                color="primary"
                variant="outlined"
                title={getSpecialtyDescription(spec)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.lighter',
                    cursor: 'help',
                  },
                }}
              />
            ))}
          </Stack>
        )}
        
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          <Chip label={`⭐ ${doctor.rating || 'N/A'}`} size="small" color="warning" variant="outlined" />
          <Typography variant="caption" color="text.secondary">
            Slot tiếp theo: {doctor.nextAvailableSlot || 'Chưa có'}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  </Paper>
);

// Time Slot Component
const TimeSlotCard: React.FC<{ timeSlot: SuggestedTimeSlots }> = ({ timeSlot }) => (
  <Paper elevation={1} sx={{ p: 2, mb: 1 }}>
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
      {new Date(timeSlot.date).toLocaleDateString('vi-VN')} - {timeSlot.dayOfWeek}
    </Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {timeSlot.slots.map((slot, index) => (
        <Chip
          // eslint-disable-next-line react/no-array-index-key
          key={slot.id || index}
          label={`${slot.time} - ${slot.price?.toLocaleString('vi-VN')} VNĐ`}
          color={slot.available ? 'success' : 'default'}
          variant={slot.available ? 'filled' : 'outlined'}
          size="small"
          sx={{
            mb: 0.5,
            cursor: slot.available ? 'pointer' : 'not-allowed',
            '&:hover': slot.available
              ? {
                  backgroundColor: 'success.lighter',
                  transform: 'scale(1.05)',
                }
              : {},
          }}
          title={slot.available ? 'Nhấn để chọn' : 'Không có sẵn'}
        />
      ))}
    </Stack>
  </Paper>
);

// Pricing Component
const PricingCard: React.FC<{ pricing: Pricing }> = ({ pricing }) => (
  <Paper elevation={1} sx={{ p: 2, bgcolor: 'success.50' }}>
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
      Chi phí chi tiết
    </Typography>
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">Phí bác sĩ:</Typography>
        <Typography variant="body2">
          {(pricing.doctorFee || 0).toLocaleString('vi-VN')} {pricing.currency}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">Phí nền tảng:</Typography>
        <Typography variant="body2">
          {(pricing.platformFee || 0).toLocaleString('vi-VN')} {pricing.currency}
        </Typography>
      </Stack>
      {pricing.discount && pricing.discount > 0 && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="success.main">
            Giảm giá:
          </Typography>
          <Typography variant="body2" color="success.main">
            -{pricing.discount?.toLocaleString('vi-VN')} {pricing.currency}
          </Typography>
        </Stack>
      )}
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Tổng cộng:
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
          {pricing.total.toLocaleString('vi-VN')} {pricing.currency}
        </Typography>
      </Stack>
    </Stack>
  </Paper>
);

// Symptom and Specialty Display Component
const SymptomSpecialtyDisplay: React.FC<{
  detectedSymptoms?: string[];
  recommendedSpecialties?: string[];
}> = ({ detectedSymptoms, recommendedSpecialties }) => {
  if (!detectedSymptoms?.length && !recommendedSpecialties?.length) return null;

  return (
    <Stack spacing={2}>
      {/* Detected Symptoms */}
      {detectedSymptoms && detectedSymptoms.length > 0 && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: 'warning.50',
            border: '1px solid',
            borderColor: 'warning.light',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Warning color="warning" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
              Triệu chứng đã phát hiện
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {detectedSymptoms.map((symptom, index) => (
              <Chip
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                label={symptom}
                size="small"
                color="warning"
                variant="outlined"
                sx={{
                  '&:hover': {
                    backgroundColor: 'warning.lighter',
                  },
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Recommended Specialties */}
      {recommendedSpecialties && recommendedSpecialties.length > 0 && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            bgcolor: 'info.50',
            border: '1px solid',
            borderColor: 'info.light',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <MedicalServices color="info" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'info.dark' }}>
              Chuyên khoa được khuyến nghị
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {recommendedSpecialties.map((specialty, index) => (
              <Chip
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                label={specialty}
                size="small"
                color="info"
                variant="outlined"
                sx={{
                  '&:hover': {
                    backgroundColor: 'info.lighter',
                  },
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

// Booking Info Component
const BookingInfoCard: React.FC<{ bookingInfo: BookingInfo }> = ({ bookingInfo }) => (
  <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.50' }}>
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
      Thông tin đặt lịch
    </Typography>
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <AccessTime fontSize="small" />
        <Typography variant="body2">
          <strong>Đặt trước tối thiểu:</strong> {bookingInfo.minAdvanceBooking}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <CalendarToday fontSize="small" />
        <Typography variant="body2">
          <strong>Đặt trước tối đa:</strong> {bookingInfo.maxAdvanceBooking}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Warning fontSize="small" />
        <Typography variant="body2">
          <strong>Chính sách hủy:</strong> {bookingInfo.cancellationPolicy}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Schedule fontSize="small" />
        <Typography variant="body2">
          <strong>Chính sách đổi lịch:</strong> {bookingInfo.reschedulePolicy}
        </Typography>
      </Stack>
    </Stack>
  </Paper>
);

// Doctor Filter Component
const DoctorFilter: React.FC<{
  specialties: string[];
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
}> = ({ specialties, selectedSpecialty, onSpecialtyChange }) => {
  if (specialties.length <= 1) return null;

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        Lọc theo chuyên khoa
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
          label="Tất cả"
          size="small"
          color={selectedSpecialty === 'all' ? 'primary' : 'default'}
          variant={selectedSpecialty === 'all' ? 'filled' : 'outlined'}
          onClick={() => onSpecialtyChange('all')}
          sx={{ cursor: 'pointer' }}
        />
        {specialties.map((specialty, index) => (
          <Chip
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            label={specialty}
            size="small"
            color={selectedSpecialty === specialty ? 'primary' : 'default'}
            variant={selectedSpecialty === specialty ? 'filled' : 'outlined'}
            onClick={() => onSpecialtyChange(specialty)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>
    </Paper>
  );
};

// Appointment Suggestion Component
export const AppointmentSuggestionCard: React.FC<{
  data: AppointmentSuggestion;
  onAccept?: () => void;
  onDecline?: () => void;
}> = ({ data, onAccept, onDecline }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);

  // Fetch all doctors when no recommended doctors available
  useEffect(() => {
    const hasRecommendedDoctors = (data.availableDoctors && data.availableDoctors.length > 0) || 
                                 (data.recommendedDoctors && data.recommendedDoctors.length > 0);
    
    if (!hasRecommendedDoctors && allDoctors.length === 0 && !doctorsLoading) {
      setDoctorsLoading(true);
      setDoctorsError(null);
      
      getAllDoctors()
        .then(doctors => {
          setAllDoctors(doctors);
          setDoctorsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching doctors:', error);
          setDoctorsError('Không thể tải danh sách bác sĩ');
          setDoctorsLoading(false);
        });
    }
  }, [data.availableDoctors, data.recommendedDoctors, allDoctors.length, doctorsLoading]);

  // Get doctors to display (recommended or all doctors)
  const doctorsToDisplay = useMemo(() => {
    const hasRecommendedDoctors = (data.availableDoctors && data.availableDoctors.length > 0) || 
                                 (data.recommendedDoctors && data.recommendedDoctors.length > 0);
    
    if (hasRecommendedDoctors) {
      return data.availableDoctors || data.recommendedDoctors || [];
    }
    
    return allDoctors;
  }, [data.availableDoctors, data.recommendedDoctors, allDoctors]);

  // Get all unique specialties from doctors
  const allSpecialties = useMemo(() => {
    const specialties = new Set<string>();

    doctorsToDisplay.forEach((doctor) => {
      doctor.specialty?.forEach((spec) => {
        const specialtyName = getSpecialtyName(spec);
        if (specialtyName && specialtyName !== 'Chuyên khoa') {
          specialties.add(specialtyName);
        }
      });
    });

    return Array.from(specialties);
  }, [doctorsToDisplay]);

  // Filter doctors by selected specialty
  const filteredDoctors = useMemo(() => {
    if (selectedSpecialty === 'all') return doctorsToDisplay;

    return doctorsToDisplay.filter((doctor) =>
      doctor.specialty?.some((spec) => {
        const specialtyName = getSpecialtyName(spec);
        return specialtyName === selectedSpecialty;
      })
    );
  }, [doctorsToDisplay, selectedSpecialty]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'error';
      case 'urgent':
        return 'warning';
      case 'normal':
        return 'success';
      default:
        return 'default';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return <Emergency />;
      case 'urgent':
        return <Warning />;
      case 'normal':
        return <CheckCircle />;
      default:
        return <Schedule />;
    }
  };

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'success.main' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <LocalHospital color="success" />
          <Typography variant="h6" color="success.main">
            Gợi ý đặt lịch khám
          </Typography>
        </Stack>

        {data?.suggested ? (
          <Stack spacing={3}>
            <Alert
              severity={
                (() => {
                  if (data.urgency === 'emergency') return 'error';
                  if (data.urgency === 'urgent') return 'warning';
                  return 'success';
                })()
              }
              icon={getUrgencyIcon(data.urgency)}
            >
              <Typography variant="subtitle2">
                {data.urgency === 'emergency' || data.urgency === 'urgent'
                  ? 'Khẩn cấp'
                  : 'Bình thường'}
              </Typography>
              <Typography variant="body2">{data.reason}</Typography>
            </Alert>

            {/* Symptom and Specialty Display */}
            <SymptomSpecialtyDisplay
              detectedSymptoms={data.detectedSymptoms}
              recommendedSpecialties={data.recommendedSpecialties}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MedicalServices fontSize="small" />
                    <Typography variant="body2">
                      <strong>Chuyên khoa chính:</strong>{' '}
                      {data?.recommendedSpecialty}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTime fontSize="small" />
                    <Typography variant="body2">
                      <strong>Thời gian chờ:</strong> {data.estimatedWaitTime}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>

            {/* Available Doctors - Support both old and new structure */}
            {(doctorsToDisplay.length > 0 || doctorsLoading || doctorsError) && (
              <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {doctorsToDisplay.length > 0 ? 
                      `Bác sĩ ${(data.availableDoctors && data.availableDoctors.length > 0) || (data.recommendedDoctors && data.recommendedDoctors.length > 0) ? 'được gợi ý' : 'có sẵn'} (${filteredDoctors.length})` :
                      'Bác sĩ có sẵn'
                    }
                  </Typography>

                  {/* Loading State */}
                  {doctorsLoading && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Đang tải danh sách bác sĩ...
                      </Typography>
                    </Alert>
                  )}

                  {/* Error State */}
                  {doctorsError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {doctorsError}
                      </Typography>
                    </Alert>
                  )}

                  {/* Doctor Filter - Only show if we have doctors and specialties */}
                  {doctorsToDisplay.length > 0 && allSpecialties.length > 1 && (
                    <DoctorFilter
                      specialties={allSpecialties}
                      selectedSpecialty={selectedSpecialty}
                      onSpecialtyChange={setSelectedSpecialty}
                    />
                  )}

                <Stack spacing={2}>
                    {filteredDoctors.map((doctor, index) => (
                      <DoctorCard
                        // eslint-disable-next-line react/no-array-index-key
                        key={doctor.id || index}
                        doctor={doctor}
                      />
                    ))}
                  </Stack>

                  {filteredDoctors.length === 0 && selectedSpecialty !== 'all' && !doctorsLoading && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Không có bác sĩ nào thuộc chuyên khoa &quot;{selectedSpecialty}&quot;. Vui lòng chọn
                      chuyên khoa khác.
                    </Alert>
                  )}

                  {filteredDoctors.length === 0 && selectedSpecialty === 'all' && !doctorsLoading && !doctorsError && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Không có bác sĩ nào có sẵn tại thời điểm này.
                    </Alert>
                  )}
              </Box>
            )}

            {/* Time Slots - Support both old and new structure */}
            {(data.suggestedTimeSlots || data.availableSlots) &&
              ((data.suggestedTimeSlots && data.suggestedTimeSlots.length > 0) ||
                (data.availableSlots && data.availableSlots.length > 0)) && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Lịch trống có sẵn
                </Typography>
                <Stack spacing={1}>
                    {(data.suggestedTimeSlots || data.availableSlots || []).map((timeSlot, index) => (
                      <TimeSlotCard
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        timeSlot={timeSlot}
                      />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Pricing Information */}
            {data.pricing && <PricingCard pricing={data.pricing} />}

            {/* Booking Information */}
            {data.bookingInfo && <BookingInfoCard bookingInfo={data.bookingInfo} />}

            {/* Legacy fields for backward compatibility */}
            {data.doctorName && !data.availableDoctors && (
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">{data.doctorName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {data.doctorSpecialty}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {data.location && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  <strong>Địa điểm:</strong> {data.location}
                </Typography>
              </Stack>
            )}

            {data.price && !data.pricing && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">
                  <strong>Chi phí dự kiến:</strong> {data.price.toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Stack>
            )}

            <Divider />

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => setShowBookingModal(true)}
                sx={{ minWidth: 120 }}
              >
                Đặt lịch
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={onDecline}
                sx={{ minWidth: 120 }}
              >
                Từ chối
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Alert severity="info">
            Hiện tại không cần đặt lịch khám. Hãy theo dõi sức khỏe và liên hệ khi cần thiết.
          </Alert>
        )}
      </CardContent>

      {/* Booking Modal */}
      <AppointmentBookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        data={data}
        onConfirmBooking={(bookingData) => {
          // eslint-disable-next-line no-console
          console.log('Booking confirmed:', bookingData);
          // Handle booking confirmation
          if (onAccept) onAccept();
        }}
      />
    </Card>
  );
};

// Symptom Analysis Component
export const SymptomAnalysisCard: React.FC<{ data: SymptomAnalysis }> = ({ data }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'mild':
        return 'success';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'error';
      case 'urgent':
        return 'warning';
      case 'normal':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'warning.main' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Psychology color="warning" />
          <Typography variant="h6" color="warning.main">
            Phân tích triệu chứng
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {data?.symptoms && data?.symptoms.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Triệu chứng được phát hiện:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
                {data?.symptoms?.map((symptom, index) => (
                <Chip
                    // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  label={symptom}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Stack>
          </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">
                  <strong>Mức độ:</strong>
                </Typography>
                <Chip
                  label={data.severity}
                  color={getSeverityColor(data.severity) as any}
                  size="small"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">
                  <strong>Mức độ khẩn cấp:</strong>
                </Typography>
                <Chip
                  label={data.urgency}
                  color={getUrgencyColor(data.urgency) as any}
                  size="small"
                />
              </Stack>
            </Grid>
          </Grid>

            <Alert
              severity={
                (() => {
                  if (data?.urgency === 'emergency') return 'error';
                  if (data?.urgency === 'urgent') return 'warning';
                  return 'info';
                })()
              }
          >
            <Typography variant="subtitle2">Khuyến nghị:</Typography>
            <Typography variant="body2">{data.recommendation}</Typography>
          </Alert>

          <Stack direction="row" alignItems="center" spacing={1}>
            <MedicalServices fontSize="small" />
            <Typography variant="body2" sx={{ mr: 1 }}>
              <strong>Chuyên khoa đề xuất:</strong>
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {[
                "nội khoa",
                "thần kinh",
                "hô hấp",
                "tai mũi họng",
                "nội tiết"
              ].map((specialty, idx) => (
                <Chip
                  key={specialty || idx}
                  label={specialty}
                  color="primary"
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Stack>
          </Stack>

          {data.followUpRequired && (
            <Alert severity="warning">
              <Typography variant="subtitle2">Cần theo dõi:</Typography>
              <Typography variant="body2">
                {data.followUpTime
                  ? `Theo dõi sau ${data.followUpTime}`
                  : 'Cần theo dõi định kỳ'}
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Patient Info Component
export const PatientInfoCard: React.FC<{ data: PatientInfo }> = ({ data }) => (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'info.main' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Person color="info" />
          <Typography variant="h6" color="info.main">
            Thông tin bệnh nhân
          </Typography>
        </Stack>

        {data.hasInfo ? (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  {data.name && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Person fontSize="small" />
                      <Typography variant="body2">
                        <strong>Họ tên:</strong> {data.name}
                      </Typography>
                    </Stack>
                  )}
                  {data.age && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarToday fontSize="small" />
                      <Typography variant="body2">
                        <strong>Tuổi:</strong> {data.age}
                      </Typography>
                    </Stack>
                  )}
                  {data.gender && (
                    <Typography variant="body2">
                      <strong>Giới tính:</strong> {data.gender}
                    </Typography>
                  )}
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  {data.phone && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Phone fontSize="small" />
                      <Typography variant="body2">
                        <strong>SĐT:</strong> {data.phone}
                      </Typography>
                    </Stack>
                  )}
                  {data.email && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Email fontSize="small" />
                      <Typography variant="body2">
                        <strong>Email:</strong> {data.email}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {data.address && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  <strong>Địa chỉ:</strong> {data.address}
                </Typography>
              </Stack>
            )}

            {data.medicalHistory && data.medicalHistory.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tiền sử bệnh:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {data.medicalHistory.map((history, index) => (
                    <Chip
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      label={history}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {data.allergies && data.allergies.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Dị ứng:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {data.allergies.map((allergy, index) => (
                    <Chip
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      label={allergy}
                      color="error"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        ) : (
          <Alert severity="info">
            Chưa có thông tin bệnh nhân. Vui lòng cập nhật thông tin cá nhân.
          </Alert>
        )}
      </CardContent>
    </Card>
  );

// Follow-up Appointment Component
export const FollowUpAppointmentCard: React.FC<{ data: FollowUpAppointment }> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle />;
      case 'PENDING':
        return <Schedule />;
      case 'COMPLETED':
        return <CheckCircle />;
      case 'CANCELLED':
        return <Warning />;
      default:
        return <Schedule />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: 'secondary.main',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <CalendarToday color="secondary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" color="secondary.main" fontWeight={600}>
            Lịch hẹn tái khám
          </Typography>
        </Stack>

        {data.follow_up ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tổng số lịch hẹn tái khám: {data.appointments.length}
              </Typography>
            </Box>

            {data.appointments.map((appointment, index) => (
              <Paper
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'secondary.50',
                  border: '1px solid',
                  borderColor: 'secondary.200',
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="secondary.main">
                    Lịch hẹn tái khám #{index + 1}
                  </Typography>
                  {getStatusIcon(appointment.status)}
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="secondary" />
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Ngày
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {formatDate(appointment.date)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="secondary" />
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Giờ
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {appointment.slot}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="secondary" />
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Bác sĩ
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {safeGetDoctorName(appointment.doctor)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(appointment.status)}
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Trạng thái
                          </Typography>
                          <Chip
                            label={getStatusText(appointment.status)}
                            color={getStatusColor(appointment.status) as any}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                {appointment.reason && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Lý do tái khám
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {appointment.reason}
                    </Typography>
                  </Box>
                )}

                {appointment.doctorNote && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Ghi chú bác sĩ
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {appointment.doctorNote}
                    </Typography>
                  </Box>
                )}

                {/* Payment Information */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem', mb: 1 }}
                  >
                    Thông tin thanh toán
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Phí bác sĩ:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {appointment.payment.doctorFee?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Phí nền tảng:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {appointment.payment.platformFee?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Stack>
                    {appointment.payment.discount && appointment.payment.discount > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="success.main">
                          Giảm giá:
                        </Typography>
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight={500}
                        >
                          -{appointment.payment.discount.toLocaleString('vi-VN')} VNĐ
                        </Typography>
                      </Stack>
                    )}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Tổng cộng:
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="success.main"
                      >
                        {appointment.payment.total?.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Trạng thái:</Typography>
                      <Chip
                        label={appointment.payment.status || 'Chưa thanh toán'}
                        color={appointment.payment.status === 'PAID' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body1">
              Bạn chưa có lịch hẹn tái khám nào. Hãy liên hệ với bác sĩ để được tư vấn về việc tái
              khám.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// General Info Component
export const GeneralInfoCard: React.FC<{ data: GeneralInfo }> = ({ data }) => (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'grey.300' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6">Thông tin chung</Typography>
        </Stack>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {data.message}
        </Typography>

        {data.suggestions && data.suggestions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Gợi ý:
            </Typography>
            <List dense>
              {data.suggestions.map((suggestion, index) => (
                <ListItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  sx={{ px: 0 }}
                >
                  <ListItemIcon>
                    <CheckCircle fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary={suggestion} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {data.quickActions && data.quickActions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Thao tác nhanh:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {data.quickActions.map((action, index) => (
                <Button
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Handle quick action
                    // eslint-disable-next-line no-console
                    console.log('Quick action:', action);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );

// Main JSON Data Renderer
export const ChatJsonRenderer: React.FC<{
  jsonData: ChatJsonData;
  onAppointmentAccept?: () => void;
  onAppointmentDecline?: () => void;
}> = ({ jsonData, onAppointmentAccept, onAppointmentDecline }) => {
  switch (jsonData.type) {
    case 'appointment_info':
      return <AppointmentInfoCard data={jsonData.data as AppointmentInfo} />;
    case 'appointment_suggestion':
      return (
        <AppointmentSuggestionCard 
          data={jsonData.data as AppointmentSuggestion}
          onAccept={onAppointmentAccept}
          onDecline={onAppointmentDecline}
        />
      );
    case 'symptom_analysis':
      return <SymptomAnalysisCard data={jsonData.data as SymptomAnalysis} />;
    case 'patient_info':
      return <PatientInfoCard data={jsonData.data as PatientInfo} />;
    case 'general_info':
      return <GeneralInfoCard data={jsonData.data as GeneralInfo} />;
    case 'follow_up_appointment':
      return <FollowUpAppointmentCard data={jsonData.data as FollowUpAppointment} />;
    default:
      return (
        <Alert severity="warning">
          Loại dữ liệu không được hỗ trợ: {jsonData.type}
        </Alert>
      );
  }
};

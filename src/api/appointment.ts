import { endpoints, axiosInstanceV2 } from 'src/utils/axios'

// Lưu ý: Đảm bảo endpoints.appointment có các hàm:
// - list: string
// - detail: (id: string) => string
// - create: string
// - update: (id: string) => string
// - delete: (id: string) => string
// - doctorConfirm: (id: string) => string
// - doctorReject: (id: string) => string

// Lấy danh sách lịch hẹn
export const getAppointments = async ({
  q = '',
  page = 1,
  limit = 10
}: { q?: string; page?: number; limit?: number } = {}) => {
  const params = new URLSearchParams()
  if (q) params.append('q', q)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  const response = await axiosInstanceV2.get(
    `${endpoints.appointment.list}?${params.toString()}`
  )
  return response.data
}

// Lấy chi tiết lịch hẹn
export const getAppointmentDetail = async (id: string) => {
  const response = await axiosInstanceV2.get(endpoints.appointment.detail(id))
  return response.data
}

// Tạo mới lịch hẹn
export const createAppointment = async (data: Record<string, any>) => {
  const response = await axiosInstanceV2.post(
    endpoints.appointment.create,
    data
  )
  return response.data
}

// Cập nhật lịch hẹn
export const updateAppointment = async (
  id: string,
  data: Record<string, any>
) => {
  const response = await axiosInstanceV2.patch(
    endpoints.appointment.update(id),
    data
  )
  return response.data
}

// Xoá lịch hẹn
export const deleteAppointment = async (id: string) => {
  const response = await axiosInstanceV2.delete(
    endpoints.appointment.delete(id)
  )
  return response.data
}

// Bác sĩ xác nhận lịch hẹn
export const doctorConfirmAppointment = async (id: string) => {
  const response = await axiosInstanceV2.patch(
    endpoints.appointment.doctorConfirm(id)
  )
  return response.data
}

// Bác sĩ từ chối lịch hẹn
export const doctorRejectAppointment = async (id: string, reason: string) => {
  const response = await axiosInstanceV2.patch(
    endpoints.appointment.doctorReject(id),
    { reason }
  )
  return response.data
}
export const submitDoctorRating = async ({
  doctorId,
  appointmentId,
  ratingScore,
  description
}: {
  doctorId: string
  appointmentId: string
  ratingScore: number
  description: string
}) => {
  const response = await axiosInstanceV2.patch(
    endpoints.doctors.submitRating(doctorId),
    {
      appointmentId,
      ratingScore,
      description
    }
  )
  return response
}

export const cancelAppointment = async (
  appointmentId: string,
  reason: string
) => {
  console.log('appointmentId', appointmentId)
  const response = await axiosInstanceV2.patch(
    endpoints.appointment.update(appointmentId),
    {
      status: 'CANCELLED',
      reason
    }
  )
  return response.data
}

export const rescheduleAppointment = async (
  appointmentId: string,
  data: Record<string, any>
) => {
  const response = await axiosInstanceV2.patch(
    endpoints.appointment.update(appointmentId),
    {
      ...data,
      status: 'PENDING'
    }
  )
  return response.data
}

import { endpoints, axiosInstanceV2 } from 'src/utils/axios'

// Lấy danh sách thống kê đánh giá bác sĩ
export const getDoctorReviewReport = async ({
  name = '',
  doctorId = '',
  page = 1,
  pageSize = 20
}: {
  name?: string
  doctorId?: string
  page?: number
  pageSize?: number
} = {}) => {
  const params = new URLSearchParams()
  if (name) params.append('name', name)
  if (doctorId) params.append('doctorId', doctorId)
  params.append('page', page.toString())
  params.append('pageSize', pageSize.toString())
  const response = await axiosInstanceV2.get(
    `${endpoints.report.doctorReview}?${params.toString()}`
  )
  return response.data
}

// Lấy báo cáo chuyên khoa
export const getSpecialtyReport = async ({
  timeRange,
  startDate,
  endDate,
  specialty = 'all',
  hospital = 'all',
  page = 1,
  pageSize = 20
}: {
  timeRange: string
  startDate?: string
  endDate?: string
  specialty?: string
  hospital?: string
  page?: number
  pageSize?: number
}) => {
  const params = new URLSearchParams()
  params.append('timeRange', timeRange)
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  if (specialty) params.append('specialty', specialty)
  if (hospital) params.append('hospital', hospital)
  params.append('page', page.toString())
  params.append('pageSize', pageSize.toString())
  const response = await axiosInstanceV2.get(
    `${endpoints.report.specialtyStatistics}?${params.toString()}`
  )
  return response.data
}

// Lấy báo cáo lịch hẹn bác sĩ
export const getDoctorAppointmentReport = async ({
  from_date,
  to_date,
  doctor_ids = [],
  status = 'all',
  search = '',
  page = 1,
  pageSize = 20
}: {
  from_date?: string
  to_date?: string
  doctor_ids?: string[]
  status?: string
  search?: string
  page?: number
  pageSize?: number
} = {}) => {
  const params = new URLSearchParams()
  if (from_date) params.append('from_date', from_date)
  if (to_date) params.append('to_date', to_date)
  if (doctor_ids && doctor_ids.length)
    doctor_ids.forEach(id => params.append('doctor_ids[]', id))
  if (status) params.append('status', status)
  if (search) params.append('search', search)
  params.append('page', page.toString())
  params.append('pageSize', pageSize.toString())
  const response = await axiosInstanceV2.get(
    `${endpoints.report.doctorAppointment}?${params.toString()}`
  )
  return response.data
}

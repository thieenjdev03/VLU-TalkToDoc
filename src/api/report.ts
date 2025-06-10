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

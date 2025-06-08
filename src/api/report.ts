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

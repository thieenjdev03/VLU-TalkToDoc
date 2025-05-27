// eslint-disable-next-line react-hooks/rules-of-hooks
import { useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'

import { fetcher, endpoints, axiosInstanceV2 } from 'src/utils/axios'

// 1. Lấy danh sách case
export function useGetCases({
  q = '',
  status = '',
  page = 1,
  limit = 10
} = {}) {
  const URL = useMemo(() => {
    const params = new URLSearchParams()
    if (q) params.append('q', q)
    if (status) params.append('status', status)
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    return `${endpoints.case.list}?${params.toString()}`
  }, [q, status, page, limit])

  const { data, isLoading, error, isValidating } = useSWR(
    URL ? [URL, { method: 'GET' }] : null,
    ([url, config]) => fetcher([url, config], true)
  )

  return {
    cases: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    error,
    isValidating,
    mutateCases: () => mutate(URL)
  }
}

// 2. Lấy chi tiết case
export async function getCaseDetail(id?: string) {
  if (!id) return { caseDetail: null, error: 'Thiếu ID', isLoading: false }
  try {
    const res = await axiosInstanceV2.get(endpoints.case.detail(id))
    return {
      caseDetail: res.data || null,
      error: null,
      isLoading: false
    }
  } catch (error) {
    return { caseDetail: null, error, isLoading: false }
  }
}

// 3. Tạo/cập nhật case
export async function submitCase(arg: any) {
  try {
    const res = await axiosInstanceV2.post(endpoints.case.createOrUpdate, arg)
    return res.data
  } catch (err) {
    // Xử lý lỗi, trả về hoặc throw tuỳ theo use-case
    return { error: err }
  }
}

export function useAddOffer(caseId: string) {
  const URL = endpoints.case.addOffer(caseId)
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }) => {
      const res = await axiosInstanceV2.patch(URL, arg)
      return res.data
    }
  )
  return {
    addOffer: trigger,
    isAdding: isMutating,
    error
  }
}

export async function softDeleteCase(caseId: string): Promise<any> {
  try {
    const res = await axiosInstanceV2.patch(`/case/${caseId}/delete`)
    return res.data // { message: "Đã xoá bệnh án (ẩn khỏi danh sách)" }
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Không có quyền xoá.')
    } else if (error.response?.status === 404) {
      throw new Error('Không tìm thấy bệnh án.')
    } else {
      throw new Error('Có lỗi xảy ra khi xoá bệnh án.')
    }
  }
}

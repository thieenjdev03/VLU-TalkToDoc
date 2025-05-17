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
export function useGetCaseDetail(id?: string) {
  const URL = id ? endpoints.case.detail(id) : null
  const { data, isLoading, error } = useSWR(
    URL ? [URL, { method: 'GET' }] : null,
    ([url, config]) => fetcher([url, config], true)
  )
  return {
    caseDetail: data || null,
    isLoading,
    error
  }
}

// 3. Tạo/cập nhật case
export function useSubmitCase() {
  const { trigger, isMutating, error } = useSWRMutation(
    endpoints.case.createOrUpdate,
    async (_url, { arg }) => {
      const res = await axiosInstanceV2.post(endpoints.case.createOrUpdate, arg)
      return res.data
    }
  )
  return {
    submitCase: trigger,
    isSubmitting: isMutating,
    error
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

// 5. Xoá mềm case
export function useSoftDeleteCase(caseId: string) {
  const URL = endpoints.case.softDelete(caseId)
  const { trigger, isMutating, error } = useSWRMutation(URL, async () => {
    const res = await axiosInstanceV2.patch(URL)
    return res.data
  })
  return {
    softDeleteCase: trigger,
    isDeleting: isMutating,
    error
  }
}

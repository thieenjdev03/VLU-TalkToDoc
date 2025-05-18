import { useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'

import { fetcher, endpoints, axiosInstanceV2 } from 'src/utils/axios'

import { IUserItem } from 'src/types/user'

type Props = {
  typeUser: 'doctor' | 'patient' | 'employee' | 'all' | 'user'
  query?: string
  page?: number
  limit?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export const useGetUsers = ({
  typeUser,
  query = '',
  page = 1,
  limit = 10,
  sortField = 'updatedAt',
  sortOrder = 'desc'
}: Props) => {
  // Create search endpoint with query params if provided
  const URL = useMemo(() => {
    // if (!query && page === 1 && limit === 10 && sortField === 'createAt' && sortOrder === 'asc') {
    //   return baseURL; // Use original endpoint if no search params
    // }

    const searchURLs = {
      doctor: endpoints.doctors.search,
      patient: endpoints.patients.search,
      employee: endpoints.employees.search,
      user: endpoints.users.search,
      all: endpoints.users.search
    }

    const searchURL = searchURLs[typeUser] || endpoints.users.search // Mặc định là users.search nếu typeUser không khớp

    const queryParams = new URLSearchParams()
    if (query) queryParams.append('query', query)
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())
    queryParams.append('sortField', sortField)
    queryParams.append('sortOrder', sortOrder)

    return `${searchURL}?${queryParams.toString()}`
  }, [query, page, limit, sortField, sortOrder, typeUser])

  const { data, isLoading, error, isValidating } = useSWR(
    URL ? [URL, { method: 'GET' }] : null,
    ([url, config]) => fetcher([url, config], true)
  )

  const memoizedValue = useMemo(
    () => ({
      users: (data?.data as IUserItem[]) || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && (!data || data.length === 0),
      usersURL: URL,
      mutateUsers: () => mutate(URL),
      usersTotal: data?.total || 0
    }),
    [data, error, isLoading, isValidating, URL]
  )

  return memoizedValue
}

export const useDeleteUser = ({ typeUser }: Props) => {
  const URL = useMemo(() => {
    if (typeUser === 'doctor') return endpoints.doctors.list
    if (typeUser === 'patient') return endpoints.patients.list
    if (typeUser === 'employee') return endpoints.employees.list
    if (typeUser === 'user') return endpoints.users.list
    return ''
  }, [typeUser])
  const deleteUser = async (id: string, mutateURL?: string) => {
    await axiosInstanceV2.delete(`${URL}/${id}`)
    if (mutateURL) mutate(mutateURL)
    else mutate(URL)
  }
  return { deleteUser }
}

export const useUpdateUser = ({ typeUser }: Props) => {
  const URL = useMemo(() => {
    if (typeUser === 'doctor') return endpoints.doctors.list
    if (typeUser === 'patient') return endpoints.patients.list
    if (typeUser === 'employee') return endpoints.employees.list
    if (typeUser === 'user') return endpoints.users.list
    return ''
  }, [typeUser])
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (
      _url,
      { arg }: { arg: { id: string; data: any; mutateURL?: string } }
    ) => {
      const response = await axiosInstanceV2.put(`${URL}/${arg.id}`, arg.data)
      if (arg.mutateURL) mutate(arg.mutateURL)
      return response.data
    }
  )

  return {
    updateUser: trigger,
    isUpdating: isMutating,
    error
  }
}

export const useCreateUser = ({ typeUser }: Props) => {
  const URL = useMemo(() => {
    if (typeUser === 'doctor') return endpoints.doctors.create
    if (typeUser === 'patient') return endpoints.patients.create
    if (typeUser === 'employee') return endpoints.employees.create
    if (typeUser === 'user') return endpoints.users.create
    return ''
  }, [typeUser])
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: { data: any } }) => {
      const response = await axiosInstanceV2.post(URL, arg.data)
      return response.data
    }
  )

  return {
    createUser: trigger,
    isCreating: isMutating,
    error
  }
}

export const getUserById = async (id: string, role: string) => {
  const handleURL = (userId: string, userRole: string) => {
    if (userRole === 'doctor') return endpoints.doctors.profile(userId)
    if (userRole === 'patient') return endpoints.patients.profile(userId)
    if (userRole === 'employee') return endpoints.employees.profile(userId)
    if (userRole === 'user') return endpoints.users.profile(userId)
    return ''
  }

  const baseURL = handleURL(id, role)
  const response = await axiosInstanceV2.get(baseURL)
  return response.data || null
}

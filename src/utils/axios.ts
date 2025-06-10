import axios, { AxiosRequestConfig } from 'axios'

import { API_URL } from 'src/config-global'

// ----------------------------------------------------------------------

// axiosInstance v1
const axiosInstance = axios.create({
  baseURL: 'https://api-dev-minimal-v510.vercel.app'
})

axiosInstance.interceptors.response.use(
  res => res,
  error =>
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong'
    )
)

const axiosInstanceV2 = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Custom-Header': 'CustomValue',
    'Content-Type': 'application/json'
  }
})

// Interceptor cho axiosInstance v2
axiosInstanceV2.interceptors.request.use(
  config => {
    // Thêm Bearer Token nếu có
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

axiosInstanceV2.interceptors.response.use(
  response => response,
  error => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      console.error('Unauthorized! Redirect to login.')
      // Có thể thêm logic chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error.response?.data || 'Something went wrong')
  }
)

export { axiosInstance, axiosInstanceV2 }

// ----------------------------------------------------------------------

export const fetcher = async (
  args: string | [string, AxiosRequestConfig],
  useV2 = false
) => {
  const [url, config] = Array.isArray(args) ? args : [args]
  const instance = useV2 ? axiosInstanceV2 : axiosInstance // Chọn instance dựa vào useV2
  const res = await instance.get(url, { ...config })
  return res.data
}

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  case: {
    list: '/case',
    detail: (id: string) => `/case/${id}`,
    createOrUpdate: '/case/data',
    addOffer: (id: string) => `/case/${id}/offer`,
    softDelete: (id: string) => `/case/${id}/delete`
  },
  appointment: {
    list: '/appointments',
    detail: (id: string) => `/appointments/${id}`,
    update: (id: string) => `/appointments/${id}`,
    create: '/appointments',
    doctorConfirm: (id: string) => `/appointments/${id}/confirm`,
    doctorReject: (id: string) => `/appointments/${id}/reject`,
    delete: (id: string) => `/appointments/${id}`,
    cancel: (id: string) => `/appointments/${id}/cancel`
  },
  medicine: {
    list: '/api/v1/medicines',
    delete: '/api/v1/medicines',
    update: '/api/v1/medicines/import',
    create: '/api/v1/medicines',
    search: '/api/v1/medicines'
  },
  pharmacies: {
    list: '/api/v1/pharmacies',
    delete: '/api/v1/pharmacies',
    update: '/api/v1/pharmacies',
    create: '/api/v1/pharmacies',
    search: '/api/v1/pharmacies/search'
  },
  hospital: {
    list: '/api/v1/hospitals',
    delete: '/api/v1/hospitals',
    update: '/api/v1/hospitals',
    create: '/api/v1/hospitals',
    search: '/api/v1/hospitals/search'
  },
  provider_ranking: {
    list: '/api/v1/doctor_levels',
    delete: '/api/v1/doctor_levels',
    update: '/api/v1/doctor_levels',
    create: '/api/v1/doctor_levels',
    search: '/api/v1/doctor_levels/search'
  },
  specialties: {
    list: '/api/v1/specialties',
    delete: '/api/v1/specialties',
    update: '/api/v1/specialties',
    create: '/api/v1/specialties',
    search: '/api/v1/specialties/search'
  },
  auth: {
    me: '/api/auth/me',
    login: '/api/v1/auth/login',
    register: '/api/auth/register',
    generalSettings: '/api/v1/form-config',
    forgotPassword: '/api/v1/auth/forgot-password',
    sendPasswordResetOTP: '/api/v1/otp/send-password-reset',
    resetPassword: '/api/v1/auth/reset-password'
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels'
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search'
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search'
  },
  doctors: {
    submitRating: (id: string) => `/api/v1/doctors/${id}/rating`,
    search: '/api/v1/doctors/search',
    list: '/api/v1/doctors',
    delete: '/api/v1/doctors/:id',
    update: (id: string) => `/api/v1/doctors/${id}`,
    create: '/api/v1/doctors',
    profile: (id: string) => `/api/v1/doctors/${id}`
  },
  patients: {
    search: '/api/v1/patients/search',
    list: '/api/v1/patients',
    delete: '/api/v1/patients/:id',
    update: (id: string) => `/api/v1/patients/${id}`,
    create: '/api/v1/patients',
    profile: (id: string) => `/api/v1/patients/${id}`
  },
  employees: {
    search: '/api/v1/employees/search',
    list: '/api/v1/employees',
    delete: '/api/v1/employees/:id',
    update: (id: string) => `/api/v1/employees/${id}`,
    create: '/api/v1/employees',
    profile: (id: string) => `/api/v1/employees/${id}`
  },
  users: {
    search: '/api/v1/users/search',
    list: '/api/v1/users',
    delete: '/api/v1/users/:id',
    update: (id: string) => `/api/v1/users/${id}`,
    create: '/api/v1/users',
    profile: (id: string) => `/api/v1/users/${id}`
  },
  report: {
    doctorReview: '/report/review-doctor',
    specialtyStatistics: '/report/specialty-statistics',
    doctorAppointment: '/report/doctor-appointments'
  }
}

import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';
// ----------------------------------------------------------------------

// axiosInstance v1
const axiosInstance = axios.create({
  baseURL: HOST_API,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

const axiosInstanceV2 = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Custom-Header': 'CustomValue',
    'Content-Type': 'application/json',
  },
});

// Interceptor cho axiosInstance v2
axiosInstanceV2.interceptors.request.use(
  (config) => {
    // Thêm Bearer Token nếu có
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstanceV2.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      console.error('Unauthorized! Redirect to login.');
      // Có thể thêm logic chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error.response?.data || 'Something went wrong');
  }
);

export { axiosInstance, axiosInstanceV2 };

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig], useV2 = false) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const instance = useV2 ? axiosInstanceV2 : axiosInstance; // Chọn instance dựa vào useV2
  const res = await instance.get(url, { ...config });
  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  doctors: {
    list: '/api/v1/doctors',
    delete: '/api/v1/doctors/:id',
    update: (id: string) => `/api/v1/doctors/${id}`,
    create: '/api/v1/doctors',
  },
  patients: {
    list: '/api/v1/patients',
    delete: '/api/v1/patients/:id',
    update: (id: string) => `/api/v1/patients/${id}`,
    create: '/api/v1/patients',
  },
  employees: {
    list: '/api/v1/employees',
    delete: '/api/v1/employees/:id',
    update: (id: string) => `/api/v1/employees/${id}`,
    create: '/api/v1/employees',
  },
  users: {
    list: '/api/v1/users',
    delete: '/api/v1/users/:id',
    update: (id: string) => `/api/v1/users/${id}`,
    create: '/api/v1/users',
  },
};

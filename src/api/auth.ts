import axios from 'axios'

import { endpoints, axiosInstanceV2 } from 'src/utils/axios'

import { API_URL } from 'src/config-global'

export const useLogin = () => {
  const login = async (identifier: string, password: string) => {
    const URL = endpoints.auth.login
    const response = await axiosInstanceV2.post(URL, { identifier, password })
    return response.data
  }
  return { login }
}

export const getFormConfigById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/form-config/${id}`, {
      headers: {
        accept: '*/*'
      }
    })
    return JSON.stringify(response.data)
  } catch (error) {
    console.error('Lỗi khi gọi API getFormConfigById:', error)
    throw error
  }
}

// API chức năng quên mật khẩu
export const useForgotPassword = () => {
  // Gửi yêu cầu quên mật khẩu
  const requestForgotPassword = async (email: string) => {
    try {
      const response = await axiosInstanceV2.post(
        '/api/v1/auth/forgot-password',
        { email }
      )
      return response.data
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu quên mật khẩu:', error)
      throw error
    }
  }

  // Verify OTP khi đặt lại mật khẩu
  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await axiosInstanceV2.post('/api/v1/otp/verify', {
        email,
        otp
      })
      return response.data
    } catch (error) {
      console.error('Lỗi khi xác thực OTP:', error)
      throw error
    }
  }

  // Gửi mã OTP đặt lại mật khẩu
  const sendPasswordResetOTP = async (email: string) => {
    try {
      const response = await axiosInstanceV2.post(
        '/api/v1/otp/send-password-reset',
        { email }
      )
      return response.data
    } catch (error) {
      console.error('Lỗi khi gửi mã OTP đặt lại mật khẩu:', error)
      throw error
    }
  }

  // Đặt lại mật khẩu
  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
  ) => {
    try {
      const response = await axiosInstanceV2.post(
        '/api/v1/auth/reset-password',
        {
          email,
          otp,
          newPassword
        }
      )
      return response.data
    } catch (error) {
      console.error('Lỗi khi đặt lại mật khẩu:', error)
      throw error
    }
  }

  return {
    requestForgotPassword,
    sendPasswordResetOTP,
    resetPassword,
    verifyOTP
  }
}

export const getUserProfileFromToken = async (token?: string) => {
  try {
    const accessToken = token || localStorage.getItem('accessToken')
    if (!accessToken) throw new Error('No access token')
    const response = await axiosInstanceV2.get('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    // Lấy dữ liệu gốc
    const { data } = response

    // Gán role thành uppercase nếu có, nếu không thì null hoặc undefined
    const formattedResponse = {
      ...data,
      role: data.role ? data.role.toUpperCase() : data.role
    }

    return formattedResponse
  } catch (error) {
    console.error('Lỗi khi lấy user profile:', error)
    throw error
  }
}

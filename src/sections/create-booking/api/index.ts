import axios from 'axios'

import { API_URL } from 'src/config-global'

const baseURL = `${API_URL}`
const headers = {
  accept: '*/*',
  Authorization: localStorage.getItem('accessToken')
    ? `Bearer ${localStorage.getItem('accessToken') || ''}`
    : '',
  'Content-Type': 'application/json'
}
const createPaymentURL = async (data: {
  patient: string
  amount: number
  appointmentId: string
}) => {
  const response = await axios.post(
    `${baseURL}/payment/create-payment-url`,
    data,
    {
      headers
    }
  )
  return response.data
}

export { createPaymentURL }

export const createAppointment = async (data: {
  specialty: string
  timezone: string
}) => {
  const response = await axios.post(`${baseURL}/appointments`, data, {
    headers
  })
  return response.data
}

export const updateAppointment = async (data: {
  appointmentId: string
  data: any
}) => {
  const response = await axios.patch(
    `${baseURL}/appointments/${data.appointmentId}`,
    data.data,
    {
      headers
    }
  )
  return response.data
}

export const getAppointmentById = async (data: { appointmentId: string }) => {
  const response = await axios.get(
    `${baseURL}/appointments/${data.appointmentId}`,
    {
      headers
    }
  )
  return response.data
}

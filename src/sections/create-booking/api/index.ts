import axios from 'axios';

const baseURL = 'http://localhost:3000';
const headers = {
  accept: '*/*',
  Authorization:
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRoaWVuZGV2MDMiLCJzdWIiOiI2N2ZmN2FjYWE4MDcxNDIwMjhhYmJhZWUiLCJyb2xlIjoiUEFUSUVOVCIsImlhdCI6MTc0NDc5NzMyOCwiZXhwIjoxNzQ0ODgzNzI4fQ.LPz5q5xzJ36ErfMAgecfsbF7tavSltOqL-iqch6wERM',
  'Content-Type': 'application/json',
};
const createPaymentURL = async (data: { userId: string; amount: number }) => {
  const response = await axios.post('http://localhost:3000/payment/create-payment-url', data);
  return response.data;
};

export { createPaymentURL };

export const createAppointment = async (data: { specialty: string; timezone: string }) => {
  const response = await axios.post(`${baseURL}/appointments`, data, {
    headers,
  });
  return response.data;
};

export const updateAppointment = async (data: { appointmentId: string; data: any }) => {
  const response = await axios.patch(`${baseURL}/appointments/${data.appointmentId}`, data.data, {
    headers,
  });
  return response.data;
};

export const getAppointmentById = async (data: { appointmentId: string }) => {
  const response = await axios.get(`${baseURL}/appointments/${data.appointmentId}`, {
    headers,
  });
  return response.data;
};

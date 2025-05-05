import axios from 'axios';

import { endpoints, axiosInstanceV2 } from 'src/utils/axios';

import { API_URL } from 'src/config-global';

export const useLogin = () => {
  const login = async (identifier: string, password: string) => {
    const URL = endpoints.auth.login;
    const response = await axiosInstanceV2.post(URL, { identifier, password });
    return response.data;
  };
  return { login };
};

export const getFormConfigById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/v1/form-config/${id}`, {
      headers: {
        accept: '*/*',
      },
    });
    return JSON.stringify(response.data);
  } catch (error) {
    console.error('Lỗi khi gọi API getFormConfigById:', error);
    throw error;
  }
};

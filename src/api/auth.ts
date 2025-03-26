import { endpoints, axiosInstanceV2 } from 'src/utils/axios';

export const useLogin = () => {
  const login = async (identifier: string, password: string) => {
    const URL = endpoints.auth.login;
    const response = await axiosInstanceV2.post(URL, { identifier, password });
    return response.data;
  };
  return { login };
};

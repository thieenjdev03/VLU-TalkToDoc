import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { fetcher, endpoints, axiosInstanceV2 } from 'src/utils/axios';

import { IUserItem } from 'src/types/user';

type Props = {
  typeUser: 'doctor' | 'patient' | 'employee' | 'all' | 'user';
};

export const useGetUsers = ({ typeUser }: Props) => {
  const URL = useMemo(() => {
    if (typeUser === 'doctor') return endpoints.doctors.list;
    if (typeUser === 'patient') return endpoints.patients.list;
    if (typeUser === 'user') return endpoints.users.list;
    return '';
  }, [typeUser]);

  // 🛠 Gọi API dùng SWR
  const { data, isLoading, error, isValidating } = useSWR(
    [URL, { method: 'GET' }],
    ([url, config]) => fetcher([url, config], true)
  );

  // 🛠 Xử lý dữ liệu trả về
  const memoizedValue = useMemo(
    () => ({
      users: (data as IUserItem[]) || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
};
export const useDeleteUser = () => {
  // Gọi API xóa user bằng `mutate` của `useSWR`
  const deleteDoctor = async (id: string) => {
    await axiosInstanceV2.delete(`${endpoints.doctors.list}/${id}`);
    mutate(endpoints.doctors.list);
  };

  return { deleteDoctor };
};

// 🛠 Cập nhật `useUpdateDoctor` để sử dụng `PUT` và truyền `ID` linh hoạt
export const useUpdateDoctor = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    endpoints.doctors.list,
    async (_url, { arg }: { arg: { id: string; data: any } }) => {
      const response = await axiosInstanceV2.put(`${endpoints.doctors.list}/${arg.id}`, arg.data);
      return response.data;
    }
  );

  return {
    updateDoctor: trigger,
    isUpdating: isMutating,
    error,
  };
};

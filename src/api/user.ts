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
    if (typeUser === 'employee') return endpoints.employees.list;
    if (typeUser === 'user') return endpoints.users.list;
    return '';
  }, [typeUser]);

  const { data, isLoading, error, isValidating } = useSWR(
    [URL, { method: 'GET' }],
    ([url, config]) => fetcher([url, config], true)
  );

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
export const useDeleteUser = ({ typeUser }: Props) => {
  const URL = useMemo(() => {
    if (typeUser === 'doctor') return endpoints.doctors.list;
    if (typeUser === 'patient') return endpoints.patients.list;
    if (typeUser === 'employee') return endpoints.employees.list;
    if (typeUser === 'user') return endpoints.users.list;
    return '';
  }, [typeUser]);
  const deleteUser = async (id: string) => {
    await axiosInstanceV2.delete(`${URL}/${id}`);
    mutate(URL);
  };
  return { deleteUser };
};

export const useUpdateUser = ({ typeUser }: Props) => {
  const URL = useMemo(() => {
    if (typeUser === 'doctor') return endpoints.doctors.list;
    if (typeUser === 'patient') return endpoints.patients.list;
    if (typeUser === 'employee') return endpoints.employees.list;
    if (typeUser === 'user') return endpoints.users.list;
    return '';
  }, [typeUser]);
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: { id: string; data: any } }) => {
      const response = await axiosInstanceV2.put(`${URL}/${arg.id}`, arg.data);
      return response.data;
    }
  );

  return {
    updateUser: trigger,
    isUpdating: isMutating,
    error,
  };
};

export const useCreateUser = ({ typeUser }: Props) => {
  const URL = useMemo(() => {
    if (typeUser === 'doctor') return endpoints.doctors.create;
    if (typeUser === 'patient') return endpoints.patients.create;
    if (typeUser === 'employee') return endpoints.employees.create;
    if (typeUser === 'user') return endpoints.users.create;
    return '';
  }, [typeUser]);
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: { data: any } }) => {
      const response = await axiosInstanceV2.post(URL, arg.data);
      return response.data;
    }
  );

  return {
    createUser: trigger,
    isCreating: isMutating,
    error,
  };
};

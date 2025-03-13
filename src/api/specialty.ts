import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { fetcher, endpoints, axiosInstanceV2 } from 'src/utils/axios';

import { ISpecialtyItem } from 'src/types/specialties';

export const useGetSpecialties = () => {
  const URL = endpoints.specialties.list;
  const { data, isLoading, error, isValidating } = useSWR(
    [URL, { method: 'GET' }],
    ([url, config]) => fetcher([url, config], true)
  );

  const memoizedValue = useMemo(
    () => ({
      specialties: (data as ISpecialtyItem[]) || [],
      specialtiesLoading: isLoading,
      specialtiesError: error,
      specialtiesValidating: isValidating,
      specialtiesEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
};
export const useDeleteSpecialty = () => {
  const URL = endpoints.specialties.delete;
  const deleteSpecialty = async (id: string) => {
    await axiosInstanceV2.delete(`${URL}/${id}`);
    mutate(URL);
  };
  return { deleteSpecialty };
};

export const useUpdateSpecialty = () => {
  const URL = endpoints.specialties.update;
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: { id: string; data: any } }) => {
      const response = await axiosInstanceV2.put(`${URL}/${arg.id}`, arg.data);
      return response.data;
    }
  );

  return {
    updateSpecialty: trigger,
    isUpdating: isMutating,
    error,
  };
};

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { fetcher, endpoints, axiosInstanceV2 } from 'src/utils/axios';

import { IPharmacyItem } from 'src/types/pharmacy';

export const useGetPharmacies = () => {
  const URL = endpoints.pharmacies.list;
  const { data, isLoading, error, isValidating } = useSWR(
    [URL, { method: 'GET' }],
    ([url, config]) => fetcher([url, config], true)
  );

  const memoizedValue = useMemo(
    () => ({
      pharmacies: (data as IPharmacyItem[]) || [],
      pharmaciesLoading: isLoading,
      pharmaciesError: error,
      pharmaciesValidating: isValidating,
      pharmaciesEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
};
export const useDeletePharmacy = () => {
  const URL = endpoints.pharmacies.delete;
  const deletePharmacy = async (id: string) => {
    await axiosInstanceV2.delete(`${URL}/${id}`);
    mutate(URL);
  };
  return { deletePharmacy };
};
export const useCreatePharmacy = () => {
  const URL = endpoints.pharmacies.create;
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: any }) => {
      const response = await axiosInstanceV2.post(URL, arg.data);
      return response.data;
    }
  );

  return {
    createPharmacy: trigger,
    isCreating: isMutating,
    error,
  };
};

export const useUpdatePharmacy = () => {
  const URL = endpoints.pharmacies.update;
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: { id: string; data: any } }) => {
      const response = await axiosInstanceV2.put(`${URL}/${arg.id}`, arg.data);
      return response.data;
    }
  );

  return {
    updatePharmacy: trigger,
    isUpdating: isMutating,
    error,
    pharmaciesError: error,
    mutate, // Add mutate function to the returned object
  };
};

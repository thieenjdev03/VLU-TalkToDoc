import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { fetcher, endpoints, axiosInstanceV2 } from 'src/utils/axios';

import { IPharmacyItem } from 'src/types/hospital';

export const useGetHospital = () => {
  const URL = endpoints.hospital.list;
  const { data, isLoading, error, isValidating } = useSWR(
    [URL, { method: 'GET' }],
    ([url, config]) => fetcher([url, config], true)
  );

  const memoizedValue = useMemo(
    () => ({
      hospitals: (data as IPharmacyItem[]) || [],
      hospitalsLoading: isLoading,
      hospitalsError: error,
      hospitalsValidating: isValidating,
      hospitalsEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
};

export const useDeleteHospital = () => {
  const URL = endpoints.hospital.list;
  const deleteURL = endpoints.hospital.delete;

  const deleteHospital = async (id: string) => {
    await axiosInstanceV2.delete(`${deleteURL}/${id}`);
    // Revalidate the list endpoint to refresh data
    mutate([URL, { method: 'GET' }]);
  };
  return { deleteHospital };
};

export const useCreateHospital = () => {
  const URL = endpoints.hospital.create;
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: any }) => {
      const response = await axiosInstanceV2.post(URL, arg.data);
      return response.data;
    }
  );

  return {
    createHospital: trigger,
    isCreating: isMutating,
    error,
  };
};

export const useUpdateHospital = () => {
  const URL = endpoints.hospital.list;
  const updateURL = endpoints.hospital.update;

  const { trigger, isMutating, error } = useSWRMutation(
    updateURL,
    async (_url, { arg }: { arg: { _id: string; data: any } }) => {
      try {
        const response = await axiosInstanceV2.put(`${updateURL}/${arg._id}`, arg.data);
        // Revalidate the list endpoint to refresh data
        await mutate([URL, { method: 'GET' }]);
        return response.data;
      } catch (err) {
        console.error('Error updating hospital:', err);
        throw err;
      }
    }
  );

  return {
    updateHospital: trigger,
    isUpdating: isMutating,
    error,
    hospitalsError: error,
  };
};

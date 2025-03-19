import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { fetcher, endpoints, axiosInstanceV2 } from 'src/utils/axios';

import { IRankingItem } from 'src/types/provider-ranking';

export const useGetRanking = () => {
  const URL = endpoints.provider_ranking.list;
  const { data, isLoading, error, isValidating } = useSWR(
    [URL, { method: 'GET' }],
    ([url, config]) => fetcher([url, config], true)
  );

  const memoizedValue = useMemo(
    () => ({
      providerRanking: (data as IRankingItem[]) || [],
      providerRankingLoading: isLoading,
      providerRankingError: error,
      providerRankingValidating: isValidating,
      providerRankingEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
};
export const useDeleteRanking = () => {
  const URL = endpoints.provider_ranking.delete;
  const deleteRanking = async (id: string) => {
    await axiosInstanceV2.delete(`${URL}/${id}`);
    mutate(URL);
  };
  return { deleteRanking };
};
export const useCreateRanking = () => {
  const URL = endpoints.provider_ranking.create;
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: any }) => {
      const response = await axiosInstanceV2.post(URL, arg.data);
      return response.data;
    }
  );

  return {
    createRanking: trigger,
    isCreating: isMutating,
    error,
  };
};
export const useUpdateRanking = () => {
  const URL = endpoints.provider_ranking.update;
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: { id: string; data: any } }) => {
      const response = await axiosInstanceV2.put(`${URL}/${arg.id}`, arg.data);
      return response.data;
    }
  );

  return {
    updateRanking: trigger,
    isUpdating: isMutating,
    error,
  };
};

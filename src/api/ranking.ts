import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { endpoints, axiosInstanceV2 } from 'src/utils/axios';

export const useGetRanking = ({
  query = '',
  page = 1,
  limit = 10,
  sortField = 'name',
  sortOrder = 'asc',
}: {
  query?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const URL = endpoints.provider_ranking.search;

  const { data, isLoading, error, isValidating } = useSWR(
    [URL, query, page, limit, sortField, sortOrder],
    () =>
      axiosInstanceV2
        .get(URL, {
          params: {
            query,
            page,
            limit,
            sortField,
            sortOrder,
          },
        })
        .then((res) => res.data)
  );

  const memoizedValue = useMemo(
    () => ({
      providerRanking: (data as any) || [],
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

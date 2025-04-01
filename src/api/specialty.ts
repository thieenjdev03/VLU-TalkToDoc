import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { endpoints, axiosInstanceV2 } from 'src/utils/axios';

import { ISpecialtyItem } from 'src/types/specialties';

export const useGetSpecialties = ({
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
  const URL = endpoints.specialties.search;

  const { data, isLoading, error, isValidating } = useSWR(
    [URL, query, page, limit, sortField, sortOrder],
    () =>
      axiosInstanceV2
        .get(URL, {
          params: {
            query,
            page,
            limit,
            sortOrder,
          },
        })
        .then((res) => res.data)
  );

  const memoizedValue = useMemo(
    () => ({
      specialties: data || [],
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
export const useCreateSpecialty = () => {
  const URL = endpoints.specialties.create;
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: any }) => {
      const response = await axiosInstanceV2.post(URL, arg.data);
      return response.data;
    }
  );

  return {
    createSpecialty: trigger,
    isCreating: isMutating,
    error,
  };
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
export const useSearchSpecialties = (keyword: string) => {
  const URL = endpoints.specialties.search;

  const shouldFetch = keyword.trim().length > 0;

  const { data, isLoading, error } = useSWR(shouldFetch ? [URL, keyword] : null, ([url]) =>
    axiosInstanceV2.get(url, { params: { q: keyword } }).then((res) => res.data)
  );

  return {
    searchedSpecialties: (data as ISpecialtyItem[]) || [],
    isSearching: isLoading,
    searchError: error,
  };
};

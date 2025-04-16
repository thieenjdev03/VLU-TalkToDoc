import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { endpoints, axiosInstanceV2 } from 'src/utils/axios';

type UpdateMedicineParams = {
  id: string;
  data: {
    name?: string;
    price?: number;
    quantity?: string;
    description?: string;
    isActive?: boolean;
  };
};
export const useGetMedicine = ({
  keyword = '',
  page = 1,
  limit = 10,
  sortField = 'name',
  sortOrder = 'asc',
}: {
  keyword?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const URL = endpoints.medicine.search;

  const { data, isLoading, error, isValidating } = useSWR(
    [URL, keyword, page, limit, sortField, sortOrder],
    () =>
      axiosInstanceV2
        .get(URL, {
          params: {
            keyword,
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
      medicine: (data as any) || [],
      medicineLoading: isLoading,
      medicineError: error,
      medicineValidating: isValidating,
      medicineEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
};
export const useDeleteMedicine = () => {
  const URL = endpoints.medicine.delete;
  const deleteMedicine = async (id: string) => {
    await axiosInstanceV2.delete(`${URL}/${id}`);
    mutate(URL);
  };
  return { deleteMedicine };
};
export const useCreateMedicine = () => {
  const URL = endpoints.medicine.create;
  const { trigger, isMutating, error } = useSWRMutation(
    URL,
    async (_url, { arg }: { arg: any }) => {
      const response = await axiosInstanceV2.post(URL, arg.data);
      return response.data;
    }
  );

  return {
    createMedicine: trigger,
    isCreating: isMutating,
    error,
  };
};
// Hàm gọi API thực tế
const updateMedicineFn = async (url: string, { arg }: { arg: UpdateMedicineParams }) => {
  const { id, data } = arg;
  const res = await axiosInstanceV2.put(`${url}/${id}`, data);
  return res.data;
};

// Hook SWR Mutation
export const useUpdateMedicine = () => useSWRMutation(endpoints.medicine.update, updateMedicineFn);

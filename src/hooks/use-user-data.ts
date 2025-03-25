import { mutate } from 'swr';
import { useCallback } from 'react';

import { endpoints } from 'src/utils/axios';

export function useUserData(
  typeUser: 'user' | 'doctor' | 'employee' | 'patient',
  options?: {
    query?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: string;
  }
) {
  const refreshUserData = useCallback(() => {
    const userURL = endpoints.users.list;
    mutate([
      userURL,
      {
        method: 'GET',
        params: {
          typeUser,
          query: options?.query || '',
          page: options?.page || 1,
          limit: options?.limit || 10,
          sortField: options?.sortField || 'fullName',
          sortOrder: options?.sortOrder || 'asc',
        },
      },
    ]);
  }, [typeUser, options]);

  return { refreshUserData };
}

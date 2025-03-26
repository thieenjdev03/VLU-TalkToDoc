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
    let url;
    if (typeUser === 'doctor') {
      url = endpoints.doctors.list;
    } else if (typeUser === 'patient') {
      url = endpoints.patients.list;
    } else if (typeUser === 'employee') {
      url = endpoints.employees.list;
    } else {
      url = endpoints.users.list;
    }

    mutate([
      url,
      {
        method: 'GET',
        params: {
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

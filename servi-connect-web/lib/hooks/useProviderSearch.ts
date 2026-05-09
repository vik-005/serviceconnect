import { useInfiniteQuery } from '@tanstack/react-query';
import { getProviders } from '../api/providers';

export const useProviderSearch = (filters: any) => {
  return useInfiniteQuery({
    queryKey: ['providers', filters],
    queryFn: ({ pageParam = 1 }) => getProviders({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.lastPage) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
};

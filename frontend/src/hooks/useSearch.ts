import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/api/search.api';
import { SearchParams } from '@/types/api.types';

export const useSearch = (params: SearchParams) =>
  useQuery({
    queryKey: ['search', params.q, params.page, params.type],
    queryFn: () => searchApi.search(params),
    enabled: !!params.q && params.q.trim().length > 0,
    staleTime: 2 * 60 * 1000,
  });

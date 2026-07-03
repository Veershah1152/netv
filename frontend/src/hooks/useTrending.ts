import { useQuery } from '@tanstack/react-query';
import { trendingApi } from '@/api/trending.api';

export const useTrending = (page = 1) =>
  useQuery({
    queryKey: ['trending', page],
    queryFn: () => trendingApi.getAll(page),
    staleTime: 5 * 60 * 1000,
  });

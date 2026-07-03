import { useQuery } from '@tanstack/react-query';
import { discoverApi } from '@/api/discover.api';
import { DiscoverParams } from '@/types/api.types';

export const useDiscover = (params: DiscoverParams = {}) =>
  useQuery({
    queryKey: ['discover', params],
    queryFn: () => discoverApi.discover(params),
    staleTime: 5 * 60 * 1000,
  });

export const useGenres = (type: 'movie' | 'tv' = 'movie') =>
  useQuery({
    queryKey: ['genres', type],
    queryFn: () => discoverApi.getGenres(type),
    staleTime: 60 * 60 * 1000,
  });

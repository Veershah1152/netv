import { useQuery } from '@tanstack/react-query';
import { tvApi } from '@/api/tv.api';

export const usePopularTv = (page = 1) =>
  useQuery({
    queryKey: ['tv', 'popular', page],
    queryFn: () => tvApi.getPopular(page),
    staleTime: 5 * 60 * 1000,
  });

export const useTopRatedTv = (page = 1) =>
  useQuery({
    queryKey: ['tv', 'topRated', page],
    queryFn: () => tvApi.getTopRated(page),
    staleTime: 5 * 60 * 1000,
  });

export const useTvOnTheAir = (page = 1) =>
  useQuery({
    queryKey: ['tv', 'onTheAir', page],
    queryFn: () => tvApi.getOnTheAir(page),
    staleTime: 5 * 60 * 1000,
  });

export const useTvDetails = (id: number) =>
  useQuery({
    queryKey: ['tv', id],
    queryFn: () => tvApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

export const useTvVideos = (id: number) =>
  useQuery({
    queryKey: ['tv', id, 'videos'],
    queryFn: () => tvApi.getVideos(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

export const useTvCast = (id: number) =>
  useQuery({
    queryKey: ['tv', id, 'cast'],
    queryFn: () => tvApi.getCast(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

export const useTvRecommendations = (id: number, page = 1) =>
  useQuery({
    queryKey: ['tv', id, 'recommendations', page],
    queryFn: () => tvApi.getRecommendations(id, page),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies.api';

export const usePopularMovies = (page = 1) =>
  useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => moviesApi.getPopular(page),
    staleTime: 5 * 60 * 1000,
  });

export const useTopRatedMovies = (page = 1) =>
  useQuery({
    queryKey: ['movies', 'topRated', page],
    queryFn: () => moviesApi.getTopRated(page),
    staleTime: 5 * 60 * 1000,
  });

export const useUpcomingMovies = (page = 1) =>
  useQuery({
    queryKey: ['movies', 'upcoming', page],
    queryFn: () => moviesApi.getUpcoming(page),
    staleTime: 5 * 60 * 1000,
  });

export const useMovieDetails = (id: number) =>
  useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

export const useMovieVideos = (id: number) =>
  useQuery({
    queryKey: ['movie', id, 'videos'],
    queryFn: () => moviesApi.getVideos(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

export const useMovieCast = (id: number) =>
  useQuery({
    queryKey: ['movie', id, 'cast'],
    queryFn: () => moviesApi.getCast(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

export const useMovieRecommendations = (id: number, page = 1) =>
  useQuery({
    queryKey: ['movie', id, 'recommendations', page],
    queryFn: () => moviesApi.getRecommendations(id, page),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

export const useSimilarMovies = (id: number, page = 1) =>
  useQuery({
    queryKey: ['movie', id, 'similar', page],
    queryFn: () => moviesApi.getSimilar(id, page),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

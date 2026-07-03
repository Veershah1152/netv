import client from './client';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';
import { Movie } from '@/types/movie.types';
import { TvShow } from '@/types/tv.types';
import { DiscoverParams } from '@/types/api.types';

export const discoverApi = {
  discover: (params: DiscoverParams = {}) =>
    client.get<ApiResponse<PaginatedResponse<Movie | TvShow>>>('/discover', { params })
      .then(r => r.data.data),

  getGenres: (type: 'movie' | 'tv' = 'movie') =>
    client.get<ApiResponse<{ genres: { id: number; name: string }[] }>>('/discover/genres', { params: { type } })
      .then(r => r.data.data),
};

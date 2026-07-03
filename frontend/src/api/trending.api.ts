import client from './client';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';
import { Movie } from '@/types/movie.types';

export const trendingApi = {
  getAll: (page = 1) =>
    client.get<ApiResponse<PaginatedResponse<Movie>>>('/trending', { params: { page } })
      .then(r => r.data.data),
};

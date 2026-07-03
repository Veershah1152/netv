import client from './client';
import { ApiResponse, PaginatedResponse, Credits, Video } from '@/types/common.types';
import { TvShow, TvDetail } from '@/types/tv.types';

export const tvApi = {
  getPopular: (page = 1) =>
    client.get<ApiResponse<PaginatedResponse<TvShow>>>('/tv/popular', { params: { page } })
      .then(r => r.data.data),

  getTopRated: (page = 1) =>
    client.get<ApiResponse<PaginatedResponse<TvShow>>>('/tv/top-rated', { params: { page } })
      .then(r => r.data.data),

  getOnTheAir: (page = 1) =>
    client.get<ApiResponse<PaginatedResponse<TvShow>>>('/tv/on-the-air', { params: { page } })
      .then(r => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<TvDetail>>(`/tv/${id}`)
      .then(r => r.data.data),

  getVideos: (id: number) =>
    client.get<ApiResponse<{ id: number; results: Video[] }>>(`/tv/${id}/videos`)
      .then(r => r.data.data),

  getCast: (id: number) =>
    client.get<ApiResponse<Credits>>(`/tv/${id}/cast`)
      .then(r => r.data.data),

  getRecommendations: (id: number, page = 1) =>
    client.get<ApiResponse<PaginatedResponse<TvShow>>>(`/tv/${id}/recommendations`, { params: { page } })
      .then(r => r.data.data),

  getSimilar: (id: number, page = 1) =>
    client.get<ApiResponse<PaginatedResponse<TvShow>>>(`/tv/${id}/similar`, { params: { page } })
      .then(r => r.data.data),
};

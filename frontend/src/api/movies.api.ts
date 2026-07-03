import client from './client';
import { ApiResponse, PaginatedResponse, Credits, Images, Video } from '@/types/common.types';
import { Movie, MovieDetail } from '@/types/movie.types';

export const moviesApi = {
  getPopular: (page = 1) =>
    client.get<ApiResponse<PaginatedResponse<Movie>>>('/movie/popular', { params: { page } })
      .then(r => r.data.data),

  getTopRated: (page = 1) =>
    client.get<ApiResponse<PaginatedResponse<Movie>>>('/movie/top-rated', { params: { page } })
      .then(r => r.data.data),

  getUpcoming: (page = 1) =>
    client.get<ApiResponse<PaginatedResponse<Movie>>>('/movie/upcoming', { params: { page } })
      .then(r => r.data.data),

  getById: (id: number) =>
    client.get<ApiResponse<MovieDetail>>(`/movie/${id}`)
      .then(r => r.data.data),

  getVideos: (id: number) =>
    client.get<ApiResponse<{ id: number; results: Video[] }>>(`/movie/${id}/videos`)
      .then(r => r.data.data),

  getCast: (id: number) =>
    client.get<ApiResponse<Credits>>(`/movie/${id}/cast`)
      .then(r => r.data.data),

  getImages: (id: number) =>
    client.get<ApiResponse<Images>>(`/movie/${id}/images`)
      .then(r => r.data.data),

  getRecommendations: (id: number, page = 1) =>
    client.get<ApiResponse<PaginatedResponse<Movie>>>(`/movie/${id}/recommendations`, { params: { page } })
      .then(r => r.data.data),

  getSimilar: (id: number, page = 1) =>
    client.get<ApiResponse<PaginatedResponse<Movie>>>(`/movie/${id}/similar`, { params: { page } })
      .then(r => r.data.data),
};

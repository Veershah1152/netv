import { tmdbGet } from './tmdb.service';
import { PaginatedResponse, Credits } from '../models/common.model';
import { TvShow, TvDetail } from '../models/tv.model';

export const getPopularTv = (page = 1) =>
  tmdbGet<PaginatedResponse<TvShow>>('/tv/popular', { page });

export const getTopRatedTv = (page = 1) =>
  tmdbGet<PaginatedResponse<TvShow>>('/tv/top_rated', { page });

export const getTvOnTheAir = (page = 1) =>
  tmdbGet<PaginatedResponse<TvShow>>('/tv/on_the_air', { page });

export const getTvDetails = (id: number) =>
  tmdbGet<TvDetail>(`/tv/${id}`);

export const getTvVideos = (id: number) =>
  tmdbGet<{ id: number; results: import('../models/common.model').Video[] }>(`/tv/${id}/videos`);

export const getTvCredits = (id: number) =>
  tmdbGet<Credits>(`/tv/${id}/credits`);

export const getTvRecommendations = (id: number, page = 1) =>
  tmdbGet<PaginatedResponse<TvShow>>(`/tv/${id}/recommendations`, { page });

export const getSimilarTv = (id: number, page = 1) =>
  tmdbGet<PaginatedResponse<TvShow>>(`/tv/${id}/similar`, { page });

import { tmdbGet } from './tmdb.service';
import { PaginatedResponse } from '../models/common.model';
import { Movie } from '../models/movie.model';
import { TvShow } from '../models/tv.model';

export interface DiscoverParams {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  primary_release_year?: number;
  'vote_average.gte'?: number;
  with_original_language?: string;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
}

export const discoverMovies = (params: DiscoverParams = {}) =>
  tmdbGet<PaginatedResponse<Movie>>('/discover/movie', params as Record<string, string | number | boolean>);

export const discoverTv = (params: DiscoverParams = {}) =>
  tmdbGet<PaginatedResponse<TvShow>>('/discover/tv', params as Record<string, string | number | boolean>);

export const getGenres = () =>
  tmdbGet<{ genres: { id: number; name: string }[] }>('/genre/movie/list');

export const getTvGenres = () =>
  tmdbGet<{ genres: { id: number; name: string }[] }>('/genre/tv/list');

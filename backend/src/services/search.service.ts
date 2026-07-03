import { tmdbGet } from './tmdb.service';
import { PaginatedResponse } from '../models/common.model';

export interface SearchResult {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  popularity: number;
  profile_path?: string | null;
  known_for_department?: string;
}

export const searchMulti = (query: string, page = 1) =>
  tmdbGet<PaginatedResponse<SearchResult>>('/search/multi', { query, page });

export const searchMovies = (query: string, page = 1) =>
  tmdbGet<PaginatedResponse<SearchResult>>('/search/movie', { query, page });

export const searchTv = (query: string, page = 1) =>
  tmdbGet<PaginatedResponse<SearchResult>>('/search/tv', { query, page });

export const searchPeople = (query: string, page = 1) =>
  tmdbGet<PaginatedResponse<SearchResult>>('/search/person', { query, page });

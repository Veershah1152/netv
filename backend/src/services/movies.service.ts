import { tmdbGet } from './tmdb.service';
import { PaginatedResponse, Credits, Images } from '../models/common.model';
import { Movie, MovieDetail } from '../models/movie.model';

export const getTrendingMovies = (page = 1) =>
  tmdbGet<PaginatedResponse<Movie>>('/trending/all/week', { page });

export const getPopularMovies = (page = 1) =>
  tmdbGet<PaginatedResponse<Movie>>('/movie/popular', { page });

export const getTopRatedMovies = (page = 1) =>
  tmdbGet<PaginatedResponse<Movie>>('/movie/top_rated', { page });

export const getUpcomingMovies = (page = 1) =>
  tmdbGet<PaginatedResponse<Movie>>('/movie/upcoming', { page });

export const getMovieDetails = (id: number) =>
  tmdbGet<MovieDetail>(`/movie/${id}`);

export const getMovieVideos = (id: number) =>
  tmdbGet<{ id: number; results: import('../models/common.model').Video[] }>(`/movie/${id}/videos`);

export const getMovieCredits = (id: number) =>
  tmdbGet<Credits>(`/movie/${id}/credits`);

export const getMovieImages = (id: number) =>
  tmdbGet<Images>(`/movie/${id}/images`);

export const getMovieRecommendations = (id: number, page = 1) =>
  tmdbGet<PaginatedResponse<Movie>>(`/movie/${id}/recommendations`, { page });

export const getSimilarMovies = (id: number, page = 1) =>
  tmdbGet<PaginatedResponse<Movie>>(`/movie/${id}/similar`, { page });

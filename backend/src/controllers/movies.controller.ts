import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getMovieImages,
  getMovieRecommendations,
  getSimilarMovies,
} from '../services/movies.service';

export const getPopular = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const data = await getPopularMovies(page);
  res.json({ success: true, data });
});

export const getTopRated = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const data = await getTopRatedMovies(page);
  res.json({ success: true, data });
});

export const getUpcoming = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const data = await getUpcomingMovies(page);
  res.json({ success: true, data });
});

export const getMovieById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getMovieDetails(id);
  res.json({ success: true, data });
});

export const getMovieVideosById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getMovieVideos(id);
  res.json({ success: true, data });
});

export const getMovieCastById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getMovieCredits(id);
  res.json({ success: true, data });
});

export const getMovieImagesById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getMovieImages(id);
  res.json({ success: true, data });
});

export const getMovieRecommendationsById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const page = parseInt(req.query.page as string) || 1;
  const data = await getMovieRecommendations(id, page);
  res.json({ success: true, data });
});

export const getSimilarMoviesById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const page = parseInt(req.query.page as string) || 1;
  const data = await getSimilarMovies(id, page);
  res.json({ success: true, data });
});

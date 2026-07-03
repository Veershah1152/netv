import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getPopularTv,
  getTopRatedTv,
  getTvOnTheAir,
  getTvDetails,
  getTvVideos,
  getTvCredits,
  getTvRecommendations,
  getSimilarTv,
} from '../services/tv.service';

export const getTvPopular = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const data = await getPopularTv(page);
  res.json({ success: true, data });
});

export const getTvTopRated = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const data = await getTopRatedTv(page);
  res.json({ success: true, data });
});

export const getTvOnAir = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const data = await getTvOnTheAir(page);
  res.json({ success: true, data });
});

export const getTvById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getTvDetails(id);
  res.json({ success: true, data });
});

export const getTvVideosById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getTvVideos(id);
  res.json({ success: true, data });
});

export const getTvCastById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getTvCredits(id);
  res.json({ success: true, data });
});

export const getTvRecommendationsById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const page = parseInt(req.query.page as string) || 1;
  const data = await getTvRecommendations(id, page);
  res.json({ success: true, data });
});

export const getSimilarTvById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const page = parseInt(req.query.page as string) || 1;
  const data = await getSimilarTv(id, page);
  res.json({ success: true, data });
});

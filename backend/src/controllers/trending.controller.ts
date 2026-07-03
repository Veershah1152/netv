import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getTrendingMovies } from '../services/movies.service';

export const getTrending = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const data = await getTrendingMovies(page);
  res.json({ success: true, data });
});

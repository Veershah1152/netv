import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { searchMulti, searchMovies, searchTv, searchPeople } from '../services/search.service';
import { ApiError } from '../utils/apiError';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;
  const type = (req.query.type as string) || 'multi';

  if (!query || query.trim().length === 0) {
    throw new ApiError(400, 'Search query is required');
  }

  let data;
  switch (type) {
    case 'movie':
      data = await searchMovies(query, page);
      break;
    case 'tv':
      data = await searchTv(query, page);
      break;
    case 'person':
      data = await searchPeople(query, page);
      break;
    default:
      data = await searchMulti(query, page);
  }

  res.json({ success: true, data });
});

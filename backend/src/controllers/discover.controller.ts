import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { discoverMovies, discoverTv, getGenres, getTvGenres, DiscoverParams } from '../services/discover.service';

export const discover = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    sort_by = 'popularity.desc',
    with_genres,
    primary_release_year,
    'vote_average.gte': voteGte,
    with_original_language,
    type = 'movie',
  } = req.query as Record<string, string>;

  const params: DiscoverParams = {
    page: parseInt(page),
    sort_by,
  };

  if (with_genres) params.with_genres = with_genres;
  if (primary_release_year) params.primary_release_year = parseInt(primary_release_year);
  if (voteGte) params['vote_average.gte'] = parseFloat(voteGte);
  if (with_original_language) params.with_original_language = with_original_language;

  const data = type === 'tv' ? await discoverTv(params) : await discoverMovies(params);
  res.json({ success: true, data });
});

export const genres = asyncHandler(async (req: Request, res: Response) => {
  const type = (req.query.type as string) || 'movie';
  const data = type === 'tv' ? await getTvGenres() : await getGenres();
  res.json({ success: true, data });
});

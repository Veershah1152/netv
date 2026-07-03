import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getPlayersForMedia } from '../services/player.service';
import { ApiError } from '../utils/apiError';

export const getPlayers = asyncHandler(async (req: Request, res: Response) => {
  const tmdbId = parseInt(req.params.tmdbId, 10);
  if (isNaN(tmdbId)) {
    throw new ApiError(400, 'Invalid TMDB ID');
  }

  const mediaType = req.query.type as 'movie' | 'tv';
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    throw new ApiError(400, 'Invalid media type. Must be "movie" or "tv".');
  }

  const season = parseInt(req.query.season as string, 10) || 1;
  const episode = parseInt(req.query.episode as string, 10) || 1;

  const players = await getPlayersForMedia(tmdbId, mediaType, season, episode);

  res.json({
    success: true,
    data: players,
  });
});

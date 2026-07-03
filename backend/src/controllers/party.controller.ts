import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { supabase } from '../config/supabase';
import { ApiError } from '../utils/apiError';

// Create a new Watch Party
export const createParty = asyncHandler(async (req: Request, res: Response) => {
  const hostId = req.user?.id;
  if (!hostId) throw new ApiError(401, 'Unauthorized');

  const { movieId, mediaType, season, episode } = req.body;
  if (!movieId || !mediaType) {
    throw new ApiError(400, 'movieId and mediaType are required');
  }

  // Create watch party entry in Supabase DB
  const { data, error } = await supabase
    .from('watch_parties')
    .insert({
      host_id: hostId,
      movie_id: movieId,
      media_type: mediaType,
      season: mediaType === 'tv' ? season || 1 : null,
      episode: mediaType === 'tv' ? episode || 1 : null,
      playback_state: 'pause',
      playback_position: 0.0,
      is_active: true,
    })
    .select();

  if (error) throw new ApiError(500, error.message);

  res.json({
    success: true,
    data: data[0],
    message: 'Watch Party created',
  });
});

// Fetch active party details
export const getPartyDetails = asyncHandler(async (req: Request, res: Response) => {
  const partyId = req.params.partyId;

  const { data, error } = await supabase
    .from('watch_parties')
    .select('*')
    .eq('id', partyId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Watch Party not found or inactive');
  }

  res.json({
    success: true,
    data,
  });
});

// Clean up party / deactivate party
export const deactivateParty = asyncHandler(async (req: Request, res: Response) => {
  const hostId = req.user?.id;
  const partyId = req.params.partyId;

  const { error } = await supabase
    .from('watch_parties')
    .update({ is_active: false })
    .eq('id', partyId)
    .eq('host_id', hostId);

  if (error) throw new ApiError(500, error.message);

  res.json({
    success: true,
    message: 'Watch Party deactivated successfully',
  });
});

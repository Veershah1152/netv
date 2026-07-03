import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { supabase } from '../config/supabase';
import { ApiError } from '../utils/apiError';

// Toggle watched status (adds if unwatched, deletes if watched)
export const toggleWatched = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const { movieId, mediaType, season, episode } = req.body;
  if (!movieId || !mediaType) {
    throw new ApiError(400, 'movieId and mediaType are required');
  }

  // Check if already watched
  let query = supabase
    .from('watched_content')
    .select('*')
    .eq('user_id', userId)
    .eq('movie_id', movieId)
    .eq('media_type', mediaType);

  if (mediaType === 'tv') {
    query = query.eq('season', season || 1).eq('episode', episode || 1);
  }

  const { data: existing, error: checkError } = await query;
  if (checkError) throw new ApiError(500, checkError.message);

  if (existing && existing.length > 0) {
    // Delete entry
    let deleteQuery = supabase
      .from('watched_content')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .eq('media_type', mediaType);

    if (mediaType === 'tv') {
      deleteQuery = deleteQuery.eq('season', season || 1).eq('episode', episode || 1);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw new ApiError(500, deleteError.message);

    res.json({
      success: true,
      watched: false,
      message: 'Removed from watched history',
    });
    return;
  } else {
    // Insert entry
    const insertData: any = {
      user_id: userId,
      movie_id: movieId,
      media_type: mediaType,
      watched_at: new Date().toISOString(),
    };

    if (mediaType === 'tv') {
      insertData.season = season || 1;
      insertData.episode = episode || 1;
    }

    const { error: insertError } = await supabase
      .from('watched_content')
      .insert(insertData);

    if (insertError) throw new ApiError(500, insertError.message);

    res.json({
      success: true,
      watched: true,
      message: 'Marked as watched',
    });
    return;
  }
});

// Get user watched list
export const getWatchedList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const { data, error } = await supabase
    .from('watched_content')
    .select('*')
    .eq('user_id', userId)
    .order('watched_at', { ascending: false });

  if (error) throw new ApiError(500, error.message);

  res.json({
    success: true,
    data,
  });
});

// Check if a item is watched
export const checkWatchedStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const movieId = parseInt(req.params.movieId, 10);
  const mediaType = req.query.type as 'movie' | 'tv';

  if (isNaN(movieId) || !mediaType) {
    throw new ApiError(400, 'Invalid parameters');
  }

  let query = supabase
    .from('watched_content')
    .select('*')
    .eq('user_id', userId)
    .eq('movie_id', movieId)
    .eq('media_type', mediaType);

  if (mediaType === 'tv') {
    const season = parseInt(req.query.season as string, 10) || 1;
    const episode = parseInt(req.query.episode as string, 10) || 1;
    query = query.eq('season', season).eq('episode', episode);
  }

  const { data, error } = await query;
  if (error) throw new ApiError(500, error.message);

  res.json({
    success: true,
    watched: data && data.length > 0,
  });
});

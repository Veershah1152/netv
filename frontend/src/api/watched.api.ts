import client from './client';

export interface WatchedItem {
  id: string;
  user_id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';
  watched_at: string;
  season?: number;
  episode?: number;
}

export const toggleWatched = async (
  movieId: number,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): Promise<{ success: boolean; watched: boolean; message: string }> => {
  const response = await client.post('/watched/toggle', {
    movieId,
    mediaType,
    season,
    episode,
  });
  return response.data;
};

export const getWatchedList = async (): Promise<WatchedItem[]> => {
  const response = await client.get('/watched/list');
  return response.data.data;
};

export const checkWatchedStatus = async (
  movieId: number,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): Promise<boolean> => {
  const response = await client.get(`/watched/status/${movieId}`, {
    params: { type: mediaType, season, episode },
  });
  return response.data.watched;
};

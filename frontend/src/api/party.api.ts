import client from './client';

export interface WatchPartyDetails {
  id: string;
  host_id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  playback_state: 'play' | 'pause';
  playback_position: number;
  state_updated_at: string;
  is_active: boolean;
  created_at: string;
}

export const createParty = async (
  movieId: number,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): Promise<WatchPartyDetails> => {
  const response = await client.post('/parties/create', {
    movieId,
    mediaType,
    season,
    episode,
  });
  return response.data.data;
};

export const getPartyDetails = async (partyId: string): Promise<WatchPartyDetails> => {
  const response = await client.get(`/parties/details/${partyId}`);
  return response.data.data;
};

export const deactivateParty = async (partyId: string): Promise<any> => {
  const response = await client.put(`/parties/deactivate/${partyId}`);
  return response.data;
};

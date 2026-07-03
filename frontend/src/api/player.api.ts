import client from './client';
import { PlayerInfo } from '../types/player.types';

export const getPlayers = async (
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  season = 1,
  episode = 1
): Promise<PlayerInfo[]> => {
  const response = await client.get<{ success: boolean; data: PlayerInfo[] }>(
    `/players/${tmdbId}`,
    {
      params: { type: mediaType, season, episode },
    }
  );
  return response.data.data;
};

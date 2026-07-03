import { useQuery } from '@tanstack/react-query';
import { getPlayers } from '../api/player.api';

export const usePlayers = (
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  season = 1,
  episode = 1
) => {
  return useQuery({
    queryKey: ['players', tmdbId, mediaType, season, episode],
    queryFn: () => getPlayers(tmdbId, mediaType, season, episode),
    enabled: tmdbId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

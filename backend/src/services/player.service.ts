import { getMovieVideos } from './movies.service';
import { getTvVideos } from './tv.service';
import { config } from '../config/env';

interface PlayerInfo {
  id: string;
  name: string;
  type: 'youtube' | 'iframe';
  url: string;
}

export const getPlayersForMedia = async (
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  season = 1,
  episode = 1
): Promise<PlayerInfo[]> => {
  const players: PlayerInfo[] = [];

  // 1. Fetch official YouTube trailer
  let trailerKey = '';
  try {
    const videosResponse =
      mediaType === 'movie'
        ? await getMovieVideos(tmdbId)
        : await getTvVideos(tmdbId);

    const trailer =
      videosResponse?.results?.find(
        (v) =>
          v.site === 'YouTube' &&
          (v.type === 'Trailer' || v.type === 'Teaser') &&
          v.official
      ) || videosResponse?.results?.find((v) => v.site === 'YouTube');

    if (trailer?.key) {
      trailerKey = trailer.key;
    }
  } catch (error) {
    console.warn(`[PlayerService] Failed to fetch trailer for ${mediaType} ${tmdbId}:`, error);
  }

  // Add Trailer (always add it, fallback to empty URL if no trailer found, or filter later)
  players.push({
    id: 'trailer',
    name: 'Trailer',
    type: 'youtube',
    url: trailerKey ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0` : '',
  });

  // 2. Player 1: Dynamic URL from VITE_PLAYER1_URL
  const p1Base = config.players.player1Url;
  const p1Url =
    mediaType === 'movie'
      ? `${p1Base}/movie/${tmdbId}`
      : `${p1Base}/tv/${tmdbId}/${season}/${episode}`;
  players.push({
    id: 'player1',
    name: 'Player 1',
    type: 'iframe',
    url: p1Url,
  });

  // 3. Player 2: Dynamic URL from VITE_PLAYER2_URL
  const p2Base = config.players.player2Url;
  const p2Url =
    mediaType === 'movie'
      ? `${p2Base}/movie/${tmdbId}`
      : `${p2Base}/tv/${tmdbId}/${season}/${episode}`;
  players.push({
    id: 'player2',
    name: 'Player 2',
    type: 'iframe',
    url: p2Url,
  });

  // 4. Player 3: Dynamic URL from VITE_PLAYER3_URL (Vidking)
  const p3Base = config.players.player3Url;
  let p3Url =
    mediaType === 'movie'
      ? `${p3Base}/movie/${tmdbId}`
      : `${p3Base}/tv/${tmdbId}/${season}/${episode}`;

  // Add dynamic Vidking parameters as requested
  p3Url += `?color=e50914&autoPlay=true`;
  if (mediaType === 'tv') {
    p3Url += `&nextEpisode=true&episodeSelector=true`;
  }

  players.push({
    id: 'player3',
    name: 'Player 3',
    type: 'iframe',
    url: p3Url,
  });

  return players;
};

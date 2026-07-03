const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getPosterUrl = (path: string | null, size = 'w342'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size = 'original'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getProfileUrl = (path: string | null, size = 'w185'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getImageUrl = (path: string | null, size = 'w500'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getFallbackPoster = (): string =>
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQyIiBoZWlnaHQ9IjUxMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzQyIiBoZWlnaHQ9IjUxMyIgZmlsbD0iIzFGMUYxRiIvPjx0ZXh0IHg9IjE3MSIgeT0iMjU2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM4MDgwODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+PC9zdmc+';

export const getFallbackBackdrop = (): string =>
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMUYxRjFGIi8+PC9zdmc+';

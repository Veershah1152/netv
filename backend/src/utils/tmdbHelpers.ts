const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size = 'w500'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size = 'original'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getPosterUrl = (path: string | null, size = 'w342'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getProfileUrl = (path: string | null, size = 'w185'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const formatRuntime = (minutes: number | null): string => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const formatCurrency = (amount: number | null): string => {
  if (!amount || amount === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

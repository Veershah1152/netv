export const formatRuntime = (minutes: number | null | undefined): string => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatYear = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return 'N/A';
  }
};

export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount || amount === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: 'compact',
    compactDisplay: 'short',
  }).format(amount);
};

export const formatRating = (rating: number | null | undefined): string => {
  if (!rating) return 'N/A';
  return rating.toFixed(1);
};

export const formatVoteCount = (count: number | null | undefined): string => {
  if (!count) return '0';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 7) return 'text-match';
  if (rating >= 5) return 'text-yellow-400';
  return 'text-red-400';
};

export const getMatchScore = (rating: number): number =>
  Math.round((rating / 10) * 100);

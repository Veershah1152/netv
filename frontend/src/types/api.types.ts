export interface DiscoverParams {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  primary_release_year?: number;
  'vote_average.gte'?: number;
  with_original_language?: string;
  type?: 'movie' | 'tv';
}

export interface SearchParams {
  q: string;
  page?: number;
  type?: 'multi' | 'movie' | 'tv' | 'person';
}

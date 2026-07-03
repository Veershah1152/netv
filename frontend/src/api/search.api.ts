import client from './client';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';
import { Movie } from '@/types/movie.types';
import { TvShow } from '@/types/tv.types';
import { SearchParams } from '@/types/api.types';

export type SearchResultItem = (Movie | TvShow) & {
  media_type: string;
  profile_path?: string | null;
  known_for_department?: string;
  name?: string;
  title?: string;
};

export const searchApi = {
  search: (params: SearchParams) =>
    client.get<ApiResponse<PaginatedResponse<SearchResultItem>>>('/search', { params: { q: params.q, page: params.page || 1, type: params.type || 'multi' } })
      .then(r => r.data.data),
};

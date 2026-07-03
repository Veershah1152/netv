export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type MediaType = 'movie' | 'tv' | 'person';

export interface ImageData {
  aspect_ratio: number;
  file_path: string;
  height: number;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface Images {
  backdrops: ImageData[];
  logos: ImageData[];
  posters: ImageData[];
}

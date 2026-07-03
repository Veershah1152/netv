import { Genre, ProductionCompany } from './common.types';

export interface TvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
  original_language: string;
  origin_country: string[];
  media_type?: string;
}

export interface TvSeason {
  id: number;
  air_date: string;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TvDetail extends TvShow {
  created_by: { id: number; name: string; profile_path: string | null }[];
  episode_run_time: number[];
  in_production: boolean;
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: TvSeason[];
  status: string;
  tagline: string;
  type: string;
  homepage: string;
  networks: { id: number; name: string; logo_path: string | null }[];
  production_companies: ProductionCompany[];
  last_air_date: string;
}

import { Genre, ProductionCompany } from './common.types';

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
  adult: boolean;
  original_language: string;
  video: boolean;
  media_type?: string;
}

export interface MovieDetail extends Movie {
  budget: number;
  revenue: number;
  runtime: number | null;
  status: string;
  tagline: string;
  homepage: string;
  imdb_id: string;
  production_companies: ProductionCompany[];
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
}

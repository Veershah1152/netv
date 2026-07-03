export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for?: KnownFor[];
}

export interface KnownFor {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
}

export interface PersonDetail extends Person {
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  gender: number;
  homepage: string | null;
  imdb_id: string;
  also_known_as: string[];
}

export interface PersonMovieCredit {
  id: number;
  title: string;
  original_title: string;
  character: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
  media_type: string;
}

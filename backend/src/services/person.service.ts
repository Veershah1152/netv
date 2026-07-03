import { tmdbGet } from './tmdb.service';
import { PersonDetail, PersonMovieCredit } from '../models/person.model';

export interface PersonCreditsResponse {
  id: number;
  cast: PersonMovieCredit[];
  crew: PersonMovieCredit[];
}

export const getPersonDetails = (id: number) =>
  tmdbGet<PersonDetail>(`/person/${id}`);

export const getPersonMovieCredits = (id: number) =>
  tmdbGet<PersonCreditsResponse>(`/person/${id}/combined_credits`);

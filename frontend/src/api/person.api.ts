import client from './client';
import { ApiResponse } from '@/types/common.types';
import { PersonDetail, PersonCredit } from '@/types/person.types';

export const personApi = {
  getById: (id: number) =>
    client.get<ApiResponse<PersonDetail>>(`/person/${id}`)
      .then(r => r.data.data),

  getCredits: (id: number) =>
    client.get<ApiResponse<{ id: number; cast: PersonCredit[]; crew: PersonCredit[] }>>(`/person/${id}/movies`)
      .then(r => r.data.data),
};

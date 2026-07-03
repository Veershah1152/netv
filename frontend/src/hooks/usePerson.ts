import { useQuery } from '@tanstack/react-query';
import { personApi } from '@/api/person.api';

export const usePersonDetails = (id: number) =>
  useQuery({
    queryKey: ['person', id],
    queryFn: () => personApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

export const usePersonCredits = (id: number) =>
  useQuery({
    queryKey: ['person', id, 'credits'],
    queryFn: () => personApi.getCredits(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

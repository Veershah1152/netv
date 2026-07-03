import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createParty, getPartyDetails, deactivateParty } from '../api/party.api';

export const usePartyDetails = (partyId: string) => {
  return useQuery({
    queryKey: ['partyDetails', partyId],
    queryFn: () => getPartyDetails(partyId),
    enabled: partyId.length > 0,
    staleTime: 5000, // short stale time for party sync checks
  });
};

export const useCreatePartyMutation = () => {
  return useMutation({
    mutationFn: (variables: {
      movieId: number;
      mediaType: 'movie' | 'tv';
      season?: number;
      episode?: number;
    }) =>
      createParty(
        variables.movieId,
        variables.mediaType,
        variables.season,
        variables.episode
      ),
  });
};

export const useDeactivatePartyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partyId: string) => deactivateParty(partyId),
    onSuccess: (_, partyId) => {
      queryClient.invalidateQueries({ queryKey: ['partyDetails', partyId] });
    },
  });
};

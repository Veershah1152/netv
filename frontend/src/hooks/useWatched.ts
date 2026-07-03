import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkWatchedStatus, getWatchedList, toggleWatched } from '../api/watched.api';
import { useAuthStore } from '../store/useAuthStore';

export const useWatchedStatus = (
  movieId: number,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
) => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['watchedStatus', movieId, mediaType, season, episode, user?.id],
    queryFn: () => checkWatchedStatus(movieId, mediaType, season, episode),
    enabled: movieId > 0 && !!user,
    staleTime: 60 * 1000,
  });
};

export const useWatchedList = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['watchedList', user?.id],
    queryFn: () => getWatchedList(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

export const useToggleWatchedMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (variables: {
      movieId: number;
      mediaType: 'movie' | 'tv';
      season?: number;
      episode?: number;
    }) =>
      toggleWatched(
        variables.movieId,
        variables.mediaType,
        variables.season,
        variables.episode
      ),
    onSuccess: (_, variables) => {
      // Invalidate target query
      queryClient.invalidateQueries({
        queryKey: [
          'watchedStatus',
          variables.movieId,
          variables.mediaType,
          variables.season,
          variables.episode,
          user?.id,
        ],
      });

      // Invalidate full list
      queryClient.invalidateQueries({
        queryKey: ['watchedList', user?.id],
      });

      // Refresh AI recommendations whenever history changes
      queryClient.invalidateQueries({
        queryKey: ['recommendations', user?.id],
      });
    },
  });
};

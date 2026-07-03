import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchFriends,
  sendFriendRequest,
  listFriendRequests,
  respondToFriendRequest,
  listFriends,
  removeFriend,
  shareRecommendation,
  listRecommendations,
  markRecommendationRead,
} from '../api/social.api';
import { useAuthStore } from '../store/useAuthStore';

export const useFriendsSearch = (query: string) => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['friendsSearch', query, user?.id],
    queryFn: () => searchFriends(query),
    enabled: query.trim().length > 1 && !!user,
    staleTime: 30 * 1000,
  });
};

export const useFriendsList = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['friendsList', user?.id],
    queryFn: () => listFriends(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });
};

export const useFriendRequests = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['friendRequests', user?.id],
    queryFn: () => listFriendRequests(),
    enabled: !!user,
    staleTime: 30 * 1000,
  });
};

export const useReceivedRecommendations = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['receivedRecommendations', user?.id],
    queryFn: () => listRecommendations(),
    enabled: !!user,
    staleTime: 30 * 1000,
  });
};

export const useSendFriendRequestMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (receiverId: string) => sendFriendRequest(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests', user?.id] });
    },
  });
};

export const useRespondToRequestMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (variables: { requestId: string; status: 'accepted' | 'rejected' }) =>
      respondToFriendRequest(variables.requestId, variables.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['friendsList', user?.id] });
    },
  });
};

export const useRemoveFriendMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (friendId: string) => removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendsList', user?.id] });
    },
  });
};

export const useShareRecommendationMutation = () => {
  return useMutation({
    mutationFn: (variables: {
      receiverIds: string[];
      movieId: number;
      mediaType: 'movie' | 'tv';
      message?: string;
    }) =>
      shareRecommendation(
        variables.receiverIds,
        variables.movieId,
        variables.mediaType,
        variables.message
      ),
  });
};

export const useMarkRecReadMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (recommendationId: string) => markRecommendationRead(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivedRecommendations', user?.id] });
    },
  });
};

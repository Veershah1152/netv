import client from './client';

export interface FriendProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface FriendRequest {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender_id?: string;
  receiver_id?: string;
  sender?: FriendProfile;
  receiver?: FriendProfile;
}

export interface SharedRecommendation {
  id: string;
  sender_id: string;
  receiver_id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: FriendProfile;
}

export const searchFriends = async (query: string): Promise<FriendProfile[]> => {
  const response = await client.get('/social/friends/search', { params: { q: query } });
  return response.data.data;
};

export const sendFriendRequest = async (receiverId: string): Promise<any> => {
  const response = await client.post('/social/friends/request', { receiverId });
  return response.data;
};

export const listFriendRequests = async (): Promise<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }> => {
  const response = await client.get('/social/friends/requests');
  return response.data.data;
};

export const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'rejected'): Promise<any> => {
  const response = await client.post('/social/friends/respond', { requestId, status });
  return response.data;
};

export const listFriends = async (): Promise<FriendProfile[]> => {
  const response = await client.get('/social/friends/list');
  return response.data.data;
};

export const removeFriend = async (friendId: string): Promise<any> => {
  const response = await client.delete(`/social/friends/remove/${friendId}`);
  return response.data;
};

export const shareRecommendation = async (
  receiverIds: string[],
  movieId: number,
  mediaType: 'movie' | 'tv',
  message?: string
): Promise<any> => {
  const response = await client.post('/social/recommendations/share', {
    receiverIds,
    movieId,
    mediaType,
    message,
  });
  return response.data;
};

export const listRecommendations = async (): Promise<SharedRecommendation[]> => {
  const response = await client.get('/social/recommendations/received');
  return response.data.data;
};

export const markRecommendationRead = async (recommendationId: string): Promise<any> => {
  const response = await client.put(`/social/recommendations/read/${recommendationId}`);
  return response.data;
};

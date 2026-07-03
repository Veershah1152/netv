import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { supabase } from '../config/supabase';
import { ApiError } from '../utils/apiError';

// Search users to add as friends
export const searchProfiles = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const query = req.query.q as string;

  if (!query || query.trim() === '') {
    res.json({ success: true, data: [] });
    return;
  }

  // Find profiles by username ILIKE, excluding current user
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .neq('id', userId)
    .ilike('username', `%${query}%`)
    .limit(10);

  if (error) throw new ApiError(500, error.message);

  res.json({
    success: true,
    data,
  });
});

// Send friend request
export const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const senderId = req.user?.id;
  const { receiverId } = req.body;

  if (!receiverId) {
    throw new ApiError(400, 'Receiver user ID is required');
  }

  if (senderId === receiverId) {
    throw new ApiError(400, 'Cannot send a friend request to yourself');
  }

  // Check if they are already friends
  const { data: existingFriend, error: friendError } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`);

  if (friendError) throw new ApiError(500, friendError.message);
  if (existingFriend && existingFriend.length > 0) {
    throw new ApiError(400, 'You are already friends with this user');
  }

  // Create request
  const { data, error } = await supabase
    .from('friend_requests')
    .insert({ sender_id: senderId, receiver_id: receiverId, status: 'pending' })
    .select();

  if (error) {
    if (error.code === '23505') {
      throw new ApiError(400, 'Friend request already pending');
    }
    throw new ApiError(500, error.message);
  }

  res.json({
    success: true,
    data: data[0],
    message: 'Friend request sent',
  });
});

// List friend requests (incoming & outgoing)
export const listFriendRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const [incoming, outgoing] = await Promise.all([
    supabase
      .from('friend_requests')
      .select('id, status, created_at, sender_id, sender:profiles!friend_requests_sender_id_fkey(id, username, avatar_url)')
      .eq('receiver_id', userId)
      .eq('status', 'pending'),
    supabase
      .from('friend_requests')
      .select('id, status, created_at, receiver_id, receiver:profiles!friend_requests_receiver_id_fkey(id, username, avatar_url)')
      .eq('sender_id', userId)
      .eq('status', 'pending'),
  ]);

  if (incoming.error) throw new ApiError(500, incoming.error.message);
  if (outgoing.error) throw new ApiError(500, outgoing.error.message);

  res.json({
    success: true,
    data: {
      incoming: incoming.data || [],
      outgoing: outgoing.data || [],
    },
  });
});

// Respond to friend request (accept / reject)
export const respondToFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const receiverId = req.user?.id;
  const { requestId, status } = req.body; // status is 'accepted' or 'rejected'

  if (!requestId || (status !== 'accepted' && status !== 'rejected')) {
    throw new ApiError(400, 'Invalid parameters');
  }

  // Get request details
  const { data: request, error: fetchError } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('id', requestId)
    .eq('receiver_id', receiverId)
    .single();

  if (fetchError || !request) {
    throw new ApiError(404, 'Friend request not found');
  }

  if (status === 'accepted') {
    // 1. Update request status to accepted
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateError) throw new ApiError(500, updateError.message);

    // 2. Insert into friends table
    const { error: friendInsertError } = await supabase
      .from('friends')
      .insert([
        { user_id: request.sender_id, friend_id: receiverId },
      ]);

    if (friendInsertError && friendInsertError.code !== '23505') {
      throw new ApiError(500, friendInsertError.message);
    }

    res.json({
      success: true,
      message: 'Friend request accepted successfully',
    });
    return;
  } else {
    // Rejected: Delete the request row or update status
    const { error: deleteError } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) throw new ApiError(500, deleteError.message);

    res.json({
      success: true,
      message: 'Friend request declined',
    });
    return;
  }
});

// List friends
export const listFriends = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const { data, error } = await supabase
    .from('friends')
    .select('id, user_id, friend_id, created_at')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (error) throw new ApiError(500, error.message);

  // Map the friend profile details
  const friendIds = data.map((f) => (f.user_id === userId ? f.friend_id : f.user_id));

  if (friendIds.length === 0) {
    res.json({ success: true, data: [] });
    return;
  }

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', friendIds);

  if (profileError) throw new ApiError(500, profileError.message);

  res.json({
    success: true,
    data: profiles || [],
  });
});

// Remove a friend
export const removeFriend = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const friendId = req.params.friendId;

  if (!friendId) throw new ApiError(400, 'Friend ID is required');

  // Delete matching rows from friends
  const { error } = await supabase
    .from('friends')
    .delete()
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

  if (error) throw new ApiError(500, error.message);

  // Also clean up any accepted requests
  await supabase
    .from('friend_requests')
    .delete()
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`);

  res.json({
    success: true,
    message: 'Friend removed successfully',
  });
});

// Recommend a title to friends
export const shareRecommendation = asyncHandler(async (req: Request, res: Response) => {
  const senderId = req.user?.id;
  const { receiverIds, movieId, mediaType, message } = req.body;

  if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0 || !movieId || !mediaType) {
    throw new ApiError(400, 'Invalid parameters');
  }

  const recommendationInserts = receiverIds.map((recId) => ({
    sender_id: senderId,
    receiver_id: recId,
    movie_id: movieId,
    media_type: mediaType,
    message: message || '',
    is_read: false,
  }));

  const { error } = await supabase
    .from('recommendations')
    .insert(recommendationInserts);

  if (error) throw new ApiError(500, error.message);

  res.json({
    success: true,
    message: `Recommendation sent to ${receiverIds.length} friends`,
  });
});

// List received recommendations
export const listRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const { data, error } = await supabase
    .from('recommendations')
    .select('*, sender:profiles!recommendations_sender_id_fkey(id, username, avatar_url)')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, error.message);

  res.json({
    success: true,
    data,
  });
});

// Mark recommendation as read
export const markRecommendationRead = asyncHandler(async (req: Request, res: Response) => {
  const receiverId = req.user?.id;
  const recId = req.params.recommendationId;

  if (!recId) throw new ApiError(400, 'Recommendation ID is required');

  const { error } = await supabase
    .from('recommendations')
    .update({ is_read: true })
    .eq('id', recId)
    .eq('receiver_id', receiverId);

  if (error) throw new ApiError(500, error.message);

  res.json({
    success: true,
    message: 'Recommendation marked as read',
  });
});

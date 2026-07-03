import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  searchProfiles,
  sendFriendRequest,
  listFriendRequests,
  respondToFriendRequest,
  listFriends,
  removeFriend,
  shareRecommendation,
  listRecommendations,
  markRecommendationRead,
} from '../controllers/social.controller';

const router = Router();

// Secure all social routes
router.use(requireAuth);

router.get('/friends/search', searchProfiles);
router.post('/friends/request', sendFriendRequest);
router.get('/friends/requests', listFriendRequests);
router.post('/friends/respond', respondToFriendRequest);
router.get('/friends/list', listFriends);
router.delete('/friends/remove/:friendId', removeFriend);

router.post('/recommendations/share', shareRecommendation);
router.get('/recommendations/received', listRecommendations);
router.put('/recommendations/read/:recommendationId', markRecommendationRead);

export default router;

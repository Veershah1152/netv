import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getRecommendations } from '../controllers/recommendations.controller';

const router = Router();

// Secure routes
router.use(requireAuth);

router.get('/', getRecommendations);

export default router;

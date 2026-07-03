import { Router } from 'express';
import { getAiRecommendations } from '../controllers/ai.controller';

const router = Router();

router.post('/recommend', getAiRecommendations);

export default router;

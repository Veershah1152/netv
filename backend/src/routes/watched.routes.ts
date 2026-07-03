import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { toggleWatched, getWatchedList, checkWatchedStatus } from '../controllers/watched.controller';

const router = Router();

// Secure all watched routes with user authentication
router.use(requireAuth);

router.post('/toggle', toggleWatched);
router.get('/list', getWatchedList);
router.get('/status/:movieId', checkWatchedStatus);

export default router;

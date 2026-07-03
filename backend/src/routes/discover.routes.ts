import { Router } from 'express';
import { discover, genres } from '../controllers/discover.controller';

const router = Router();

router.get('/', discover);
router.get('/genres', genres);

export default router;

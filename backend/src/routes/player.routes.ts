import { Router } from 'express';
import { getPlayers } from '../controllers/player.controller';

const router = Router();

router.get('/:tmdbId', getPlayers);

export default router;

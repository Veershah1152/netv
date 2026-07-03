import { Router } from 'express';
import trendingRouter from './trending.routes';
import moviesRouter from './movies.routes';
import tvRouter from './tv.routes';
import searchRouter from './search.routes';
import discoverRouter from './discover.routes';
import personRouter from './person.routes';
import playerRouter from './player.routes';
import watchedRouter from './watched.routes';
import socialRouter from './social.routes';
import recommendationsRouter from './recommendations.routes';
import partyRouter from './party.routes';
import aiRouter from './ai.routes';
import { getPopular, getTopRated, getUpcoming } from '../controllers/movies.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { getTrending } from '../controllers/trending.controller';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Standalone top-level routes
router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/top-rated', getTopRated);
router.get('/upcoming', getUpcoming);

// Resource routers
router.use('/movie', moviesRouter);
router.use('/tv', tvRouter);
router.use('/search', searchRouter);
router.use('/discover', discoverRouter);
router.use('/person', personRouter);
router.use('/players', playerRouter);
router.use('/watched', watchedRouter);
router.use('/social', socialRouter);
router.use('/recommendations', recommendationsRouter);
router.use('/parties', partyRouter);
router.use('/ai', aiRouter);

export default router;

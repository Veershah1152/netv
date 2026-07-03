import { Router } from 'express';
import {
  getTvPopular,
  getTvTopRated,
  getTvOnAir,
  getTvById,
  getTvVideosById,
  getTvCastById,
  getTvRecommendationsById,
  getSimilarTvById,
} from '../controllers/tv.controller';

const router = Router();

router.get('/popular', getTvPopular);
router.get('/top-rated', getTvTopRated);
router.get('/on-the-air', getTvOnAir);
router.get('/:id', getTvById);
router.get('/:id/videos', getTvVideosById);
router.get('/:id/cast', getTvCastById);
router.get('/:id/recommendations', getTvRecommendationsById);
router.get('/:id/similar', getSimilarTvById);

export default router;

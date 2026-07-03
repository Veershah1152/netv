import { Router } from 'express';
import {
  getPopular,
  getTopRated,
  getUpcoming,
  getMovieById,
  getMovieVideosById,
  getMovieCastById,
  getMovieImagesById,
  getMovieRecommendationsById,
  getSimilarMoviesById,
} from '../controllers/movies.controller';

const router = Router();

router.get('/popular', getPopular);
router.get('/top-rated', getTopRated);
router.get('/upcoming', getUpcoming);
router.get('/:id', getMovieById);
router.get('/:id/videos', getMovieVideosById);
router.get('/:id/cast', getMovieCastById);
router.get('/:id/images', getMovieImagesById);
router.get('/:id/recommendations', getMovieRecommendationsById);
router.get('/:id/similar', getSimilarMoviesById);

export default router;

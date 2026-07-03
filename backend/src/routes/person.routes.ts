import { Router } from 'express';
import { getPersonById, getPersonCredits } from '../controllers/person.controller';

const router = Router();

router.get('/:id', getPersonById);
router.get('/:id/movies', getPersonCredits);

export default router;

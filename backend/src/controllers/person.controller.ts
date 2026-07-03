import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getPersonDetails, getPersonMovieCredits } from '../services/person.service';

export const getPersonById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getPersonDetails(id);
  res.json({ success: true, data });
});

export const getPersonCredits = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await getPersonMovieCredits(id);
  res.json({ success: true, data });
});

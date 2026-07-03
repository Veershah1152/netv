import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getUserRecommendations } from '../services/recommendations.service';
import { ApiError } from '../utils/apiError';

export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const recommendations = await getUserRecommendations(userId);

  res.json({
    success: true,
    data: recommendations,
  });
});

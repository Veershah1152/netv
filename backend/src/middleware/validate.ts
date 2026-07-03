import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const validateQuery = (requiredFields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const field of requiredFields) {
      if (!req.query[field]) {
        return next(new ApiError(400, `Missing required query parameter: ${field}`));
      }
    }
    next();
  };
};

export const validateParams = (requiredFields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const field of requiredFields) {
      if (!req.params[field]) {
        return next(new ApiError(400, `Missing required parameter: ${field}`));
      }
    }
    next();
  };
};

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { config } from '../config/env';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (config.nodeEnv === 'development') {
    console.error('[Error]', err);
  }

  if (err instanceof ApiError && err.isOperational) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    status: 500,
    message: config.nodeEnv === 'production' ? 'Internal Server Error' : message,
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    status: 404,
    message: 'Route not found',
  });
};

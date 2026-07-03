import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

/**
 * Cloudflare Workers does not allow timers/Date in global scope.
 * We lazily create the rate-limit middleware on first request so that
 * rateLimit() is called inside a handler, not at module-load time.
 */
let _apiLimiterInstance: ReturnType<typeof rateLimit> | null = null;
function getApiLimiter() {
  if (!_apiLimiterInstance) {
    _apiLimiterInstance = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        status: 429,
        message: 'Too many requests. Please try again later.',
      },
    });
  }
  return _apiLimiterInstance;
}

export function apiLimiter(req: Request, res: Response, next: NextFunction) {
  return getApiLimiter()(req, res, next);
}

let _searchLimiterInstance: ReturnType<typeof rateLimit> | null = null;
function getSearchLimiter() {
  if (!_searchLimiterInstance) {
    _searchLimiterInstance = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        status: 429,
        message: 'Too many search requests. Please slow down.',
      },
    });
  }
  return _searchLimiterInstance;
}

export function searchLimiter(req: Request, res: Response, next: NextFunction) {
  return getSearchLimiter()(req, res, next);
}

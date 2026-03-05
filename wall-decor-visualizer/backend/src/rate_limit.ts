/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per user
 */

import { Request, Response, NextFunction } from 'express';

const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

/**
 * Rate limit middleware for upload endpoint
 * Limits to 10 uploads per hour per user
 */
export function uploadRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    const now = Date.now();
    const limit = rateLimitStore.get(userId);

    if (limit && now < limit.resetTime) {
      if (limit.count >= 10) {
        res.status(429).json({
          success: false,
          error: {
            message: 'Rate limit exceeded. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
          }
        });
        return;
      }
      limit.count++;
    } else {
      rateLimitStore.set(userId, {
        count: 1,
        resetTime: now + 3600000 // 1 hour
      });
    }

    next();
  } catch (error) {
    next();
  }
}

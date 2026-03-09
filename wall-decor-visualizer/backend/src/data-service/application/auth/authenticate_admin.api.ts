/**
 * Admin Authentication Middleware
 * Verifies that the authenticated user has admin role
 */

import { Response, NextFunction } from 'express';
import type { IAuthRequest } from './authenticate_jwt.api.js';

// Admin phone numbers (in production, this should be in database or env var)
const ADMIN_PHONE_NUMBERS = (process.env.ADMIN_PHONE_NUMBERS || '').split(',').filter(Boolean);

/**
 * Middleware to verify admin role
 * Must be used after authenticateJWT middleware
 */
export function authenticateAdmin(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Check if user is authenticated (should be set by authenticateJWT)
    if (!req.userId || !req.phoneNumber) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    // Check if user is admin
    if (!ADMIN_PHONE_NUMBERS.includes(req.phoneNumber)) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required',
          code: 'FORBIDDEN'
        }
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to verify admin role',
        code: 'ADMIN_VERIFICATION_FAILED'
      }
    });
  }
}

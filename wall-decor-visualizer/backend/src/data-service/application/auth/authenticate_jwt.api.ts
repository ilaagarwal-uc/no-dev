/**
 * JWT Authentication API
 * Validates JWT tokens and extracts user information
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface IAuthRequest extends Request {
  userId?: string;
  phoneNumber?: string;
}

/**
 * Middleware to authenticate JWT tokens
 */
export function authenticateJWT(
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Missing or invalid authorization header',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, secret) as {
      userId: string;
      phoneNumber: string;
    };

    req.userId = decoded.userId;
    req.phoneNumber = decoded.phoneNumber;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED'
      }
    });
  }
}

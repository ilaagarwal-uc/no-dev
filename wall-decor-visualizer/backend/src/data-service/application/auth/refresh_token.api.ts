import { Response } from 'express';
import jwt from 'jsonwebtoken';
import * as AuthDomain from '../../domain/auth/index.js';
import type { IAuthRequest } from './authenticate_jwt.api.js';

export interface IRefreshTokenRequest {
  // Token comes from Authorization header
}

export interface IRefreshTokenResponse {
  success: true;
  token: string;
  expiresIn: number;
}

export interface IRefreshTokenErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type RefreshTokenApiResponse = IRefreshTokenResponse | IRefreshTokenErrorResponse;

/**
 * Handles token refresh requests
 * POST /api/auth/refresh
 * 
 * Validates current token and generates a new one with updated expiration
 */
export async function refreshTokenHandler(
  req: IAuthRequest,
  res: Response
): Promise<void> {
  try {
    // Extract userId from JWT (set by authenticateJWT middleware)
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required. Please log in.',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    // Get user from database to retrieve phone number
    const user = await AuthDomain.getUserById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found. Please log in again.',
          code: 'USER_NOT_FOUND'
        }
      });
      return;
    }

    // Generate new token with userId and phoneNumber
    const authToken = AuthDomain.generateAuthToken(userId, user.phoneNumber);

    res.status(200).json({
      success: true,
      token: authToken.token,
      expiresIn: parseInt(process.env.JWT_EXPIRY || '3600')
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to refresh token. Please log in again.',
        code: 'REFRESH_FAILED'
      }
    });
  }
}

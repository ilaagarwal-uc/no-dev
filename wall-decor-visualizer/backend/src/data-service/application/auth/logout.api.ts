import { Response } from 'express';
import type { IAuthRequest } from './authenticate_jwt.api.js';

export interface ILogoutRequest {
  // Token comes from Authorization header
}

export interface ILogoutResponse {
  success: true;
  message: string;
}

export interface ILogoutErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type LogoutApiResponse = ILogoutResponse | ILogoutErrorResponse;

/**
 * Handles logout requests
 * POST /api/auth/logout
 * 
 * Clears session data and invalidates token
 * Note: JWT tokens are stateless, so we mainly clear client-side data
 * In production, you might want to maintain a token blacklist
 */
export async function logoutHandler(
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

    // Clear session cookie
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    console.log(`User logged out: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed. Please try again.',
        code: 'LOGOUT_FAILED'
      }
    });
  }
}

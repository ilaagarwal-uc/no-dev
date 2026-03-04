/**
 * User Schema
 * Stores user account information
 */
export interface IUser {
  id: string;
  phoneNumber: string;
  accountStatus: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * OTP Schema
 * Stores OTP data with expiration and attempt tracking
 * 
 * Validation Rules:
 * - OTP is 4 digits (fixed: 2213)
 * - OTP expires after 10 minutes
 * - OTP is invalidated after 5 failed attempts
 * - OTP is locked for 1 minute after 3 failed attempts
 */
export interface IOTP {
  id: string;
  phoneNumber: string;
  otpCode: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil?: Date;
  lastAttemptAt?: Date;
}

/**
 * Auth Token Schema
 * JWT token for authenticated sessions
 */
export interface IAuthToken {
  token: string;
  expiresAt: number;
  userId: string;
  phoneNumber: string;
  issuedAt: number;
}

/**
 * Refresh Token Schema
 * Long-lived token for refreshing access tokens
 */
export interface IRefreshToken {
  refreshToken: string;
  expiresAt: number;
  userId: string;
  issuedAt: number;
  isRevoked: boolean;
}

/**
 * Rate Limit Schema
 * Tracks API request attempts for rate limiting
 */
export interface IRateLimit {
  id: string;
  key: string; // "send_otp:{phone}" or "send_otp:ip:{ip}" or "verify_otp:{phone}"
  attempts: number;
  firstAttemptAt: Date;
  lastAttemptAt: Date;
  expiresAt: Date;
}

/**
 * Send OTP Request
 * Frontend sends phone number to request OTP
 */
export interface ISendOtpRequest {
  phoneNumber: string;
}

/**
 * Send OTP Response
 * Backend returns success/error
 */
export interface ISendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // OTP expiration in seconds (600 = 10 minutes)
}

/**
 * Verify OTP Request
 * Frontend sends phone number and OTP to verify
 */
export interface IVerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

/**
 * Verify OTP Response
 * Backend returns token on success or error
 */
export interface IVerifyOtpResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  userId?: string;
  expiresIn?: number;
  message?: string;
}

/**
 * Error Response
 * Standard error format for all API responses
 */
export interface IErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    timestamp: string;
    retryAfter?: number; // For rate limit errors (seconds)
  };
}

/**
 * Auth Status Type
 */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired' | 'invalid';

/**
 * Error Codes
 */
export enum ErrorCode {
  // Phone validation errors
  INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
  PHONE_REQUIRED = 'PHONE_REQUIRED',
  
  // OTP validation errors
  INVALID_OTP_FORMAT = 'INVALID_OTP_FORMAT',
  OTP_REQUIRED = 'OTP_REQUIRED',
  INVALID_OTP = 'INVALID_OTP',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_ALREADY_USED = 'OTP_ALREADY_USED',
  OTP_LOCKOUT_1_MINUTE = 'OTP_LOCKOUT_1_MINUTE',
  
  // Rate limiting errors
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Account errors
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  
  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID'
}

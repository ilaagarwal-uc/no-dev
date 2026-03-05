import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { IOTP, IAuthToken, OTPModel, UserModel, RateLimitModel } from './auth_schema.js';

// Validation functions
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

export function validateOTP(otp: string): boolean {
  const otpRegex = /^\d{4}$/;
  return otpRegex.test(otp);
}

// Sanitization functions
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, 10);
}

export function sanitizeOTP(otp: string): string {
  return otp.replace(/\D/g, '').slice(0, 4);
}

// OTP generation
export function generateOTP(): string {
  // Fixed OTP for demo
  return '2213';
}

// OTP status checks
export function isOTPExpired(otp: IOTP): boolean {
  return new Date() > new Date(otp.expiresAt);
}

export function isOTPLocked(otp: IOTP): boolean {
  if (!otp.lockedUntil) return false;
  return new Date() < new Date(otp.lockedUntil);
}

export function shouldPermanentlyInvalidate(failedAttempts: number): boolean {
  return failedAttempts >= 5;
}

// Token generation
export function generateAuthToken(userId: string, phoneNumber: string): IAuthToken {
  const expiresIn = parseInt(process.env.JWT_EXPIRY || '3600');
  
  const token = jwt.sign(
    { userId, phoneNumber },
    process.env.JWT_SECRET || 'default-secret-change-in-production',
    { expiresIn }
  );
  
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
  
  return { token, expiresAt, userId };
}

// Token verification
export function verifyAuthToken(token: string): { valid: boolean; userId?: string; phoneNumber?: string } {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret-change-in-production'
    ) as { userId: string; phoneNumber: string };
    return { valid: true, userId: decoded.userId, phoneNumber: decoded.phoneNumber };
  } catch (error) {
    return { valid: false };
  }
}

// User retrieval
export async function getUserById(userId: string): Promise<{ phoneNumber: string } | null> {
  try {
    const user = await UserModel.findById(userId);
    if (!user) return null;
    return { phoneNumber: user.phoneNumber };
  } catch (error) {
    return null;
  }
}

// Security functions
export function hashPhoneNumber(phone: string): string {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}


// Rate limiting
export async function checkRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();
  
  const rateLimit = await RateLimitModel.findOne({
    key,
    expiresAt: { $gt: now }
  });
  
  if (!rateLimit) {
    await RateLimitModel.create({
      key,
      count: 1,
      expiresAt: new Date(now.getTime() + window * 1000),
      createdAt: now
    });
    return { allowed: true };
  }
  
  if (rateLimit.count >= limit) {
    const retryAfter = Math.ceil(
      (rateLimit.expiresAt.getTime() - now.getTime()) / 1000
    );
    return { allowed: false, retryAfter };
  }
  
  rateLimit.count += 1;
  await rateLimit.save();
  
  return { allowed: true };
}

// OTP persistence
export async function createOrUpdateOTP(phoneNumber: string): Promise<void> {
  const otp = generateOTP();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
  
  await OTPModel.findOneAndUpdate(
    { phoneNumber },
    {
      otp,
      phoneNumber,
      expiresAt,
      createdAt: now,
      used: false,
      failedAttempts: 0,
      lockedUntil: null
    },
    { upsert: true, new: true }
  );
  
  console.log(`OTP generated for phone: ${hashPhoneNumber(phoneNumber)}`);
}

// OTP verification
export async function verifyOTP(phoneNumber: string, otp: string): Promise<{
  success: boolean;
  token?: string;
  userId?: string;
  error?: {
    code: string;
    message: string;
    remainingAttempts?: number;
    lockedUntil?: number;
  };
}> {
  const otpRecord = await OTPModel.findOne({ phoneNumber });
  
  if (!otpRecord) {
    return {
      success: false,
      error: {
        code: 'OTP_EXPIRED',
        message: 'OTP not found or expired. Please request a new OTP.'
      }
    };
  }
  
  if (isOTPExpired(otpRecord)) {
    return {
      success: false,
      error: {
        code: 'OTP_EXPIRED',
        message: 'OTP has expired. Please request a new OTP.'
      }
    };
  }
  
  if (otpRecord.used) {
    return {
      success: false,
      error: {
        code: 'OTP_USED',
        message: 'OTP has already been used. Please request a new OTP.'
      }
    };
  }
  
  const isValid = constantTimeCompare(otp, otpRecord.otp);
  
  if (!isValid) {
    // Always increment failed attempts, even when locked
    otpRecord.failedAttempts += 1;
    
    // Check for permanent invalidation
    if (shouldPermanentlyInvalidate(otpRecord.failedAttempts)) {
      otpRecord.used = true;
      await otpRecord.save();
      
      return {
        success: false,
        error: {
          code: 'OTP_PERMANENTLY_INVALIDATED',
          message: 'OTP permanently invalidated due to too many failed attempts. Please request a new OTP.'
        }
      };
    }
    
    if (otpRecord.failedAttempts === 3) {
      otpRecord.lockedUntil = new Date(Date.now() + 60 * 1000);
      await otpRecord.save();
      
      return {
        success: false,
        error: {
          code: 'OTP_LOCKED',
          message: 'Incorrect OTP. Too many failed attempts. Please try again in 1 minute.',
          lockedUntil: 60,
          remainingAttempts: 0
        }
      };
    }
    
    if (isOTPLocked(otpRecord)) {
      await otpRecord.save();
      
      const lockedUntil = Math.ceil(
        (new Date(otpRecord.lockedUntil!).getTime() - Date.now()) / 1000
      );
      
      return {
        success: false,
        error: {
          code: 'OTP_LOCKED',
          message: `Incorrect OTP. Too many failed attempts. Please try again in ${lockedUntil} seconds.`,
          lockedUntil,
          remainingAttempts: 0
        }
      };
    }
    
    await otpRecord.save();
    
    const remainingAttempts = 5 - otpRecord.failedAttempts;
    return {
      success: false,
      error: {
        code: 'INCORRECT_OTP',
        message: `Incorrect OTP. ${remainingAttempts} attempts remaining.`,
        remainingAttempts
      }
    };
  }
  
  otpRecord.used = true;
  await otpRecord.save();
  
  let user = await UserModel.findOne({ phoneNumber });
  
  if (!user) {
    user = await UserModel.create({
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } else {
    user.updatedAt = new Date();
    await user.save();
  }
  
  const authToken = generateAuthToken(user.id, phoneNumber);
  
  console.log(`User authenticated: ${hashPhoneNumber(phoneNumber)}`);
  
  return {
    success: true,
    token: authToken.token,
    userId: user.id
  };
}


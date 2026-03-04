import {
  ISendOtpRequest,
  ISendOtpResponse,
  IVerifyOtpRequest,
  IVerifyOtpResponse,
  IErrorResponse,
  ErrorCode,
  IOTP
} from '@data-service/domain/auth/auth_schema';

/**
 * Send OTP API
 * 
 * Endpoint: POST /api/auth/send-otp
 * 
 * Validation Rules:
 * - Phone number must be exactly 10 digits
 * - Phone number must contain only numeric characters
 * - Rate limit: Max 3 requests per phone per 10 minutes
 * - Rate limit: Max 10 requests per IP per hour
 * 
 * Response:
 * - Success: 200 OK with OTP expiration time
 * - Error: 400/429/503 with error details
 */
export const handleSendOtp = async (
  request: ISendOtpRequest
): Promise<ISendOtpResponse | IErrorResponse> => {
  try {
    // Step 1: Validate phone number format
    const phoneValidation = validatePhoneNumberFormat(request.phoneNumber);
    if (!phoneValidation.valid) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_PHONE_FORMAT,
          message: phoneValidation.error,
          field: 'phoneNumber',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Step 2: Check rate limit (per phone number)
    const phoneRateLimitExceeded = await checkRateLimit(
      `send_otp:${request.phoneNumber}`,
      3,
      10 * 60 // 10 minutes
    );
    if (phoneRateLimitExceeded) {
      return {
        success: false,
        error: {
          code: ErrorCode.TOO_MANY_ATTEMPTS,
          message: 'Too many attempts. Please wait 5 minutes before trying again',
          timestamp: new Date().toISOString(),
          retryAfter: 300 // 5 minutes
        }
      };
    }

    // Step 3: Check rate limit (per IP address)
    const ipRateLimitExceeded = await checkRateLimit(
      `send_otp:ip:{ip_address}`,
      10,
      60 * 60 // 1 hour
    );
    if (ipRateLimitExceeded) {
      return {
        success: false,
        error: {
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message: 'Too many requests from your IP. Please try again later',
          timestamp: new Date().toISOString(),
          retryAfter: 3600 // 1 hour
        }
      };
    }

    // Step 4: Check if account exists and is active
    const accountStatus = await checkAccountStatus(request.phoneNumber);
    if (accountStatus === 'not_found') {
      // For security: Don't reveal if account exists
      // Return generic success message
    } else if (accountStatus === 'suspended') {
      return {
        success: false,
        error: {
          code: ErrorCode.ACCOUNT_SUSPENDED,
          message: 'Account is suspended. Please contact support',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Step 5: Generate OTP (fixed: 2213)
    const otp = '2213';
    const otpData: IOTP = {
      id: generateId(),
      phoneNumber: request.phoneNumber,
      otpCode: otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isUsed: false,
      failedAttempts: 0,
      isLocked: false
    };

    // Step 6: Store OTP in database
    await storeOtp(otpData);

    // Step 7: Send OTP via SMS (or mock in development)
    const smsSent = await sendOtpViaSms(request.phoneNumber, otp);
    if (!smsSent) {
      return {
        success: false,
        error: {
          code: ErrorCode.SERVICE_UNAVAILABLE,
          message: 'Service temporarily unavailable. Please try again',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Step 8: Record rate limit attempt
    await recordRateLimitAttempt(`send_otp:${request.phoneNumber}`, 10 * 60);
    await recordRateLimitAttempt(`send_otp:ip:{ip_address}`, 60 * 60);

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    };
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      error: {
        code: ErrorCode.SERVER_ERROR,
        message: 'Server error. Please try again later',
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Verify OTP API
 * 
 * Endpoint: POST /api/auth/verify-otp
 * 
 * Validation Rules:
 * - OTP must be exactly 4 digits
 * - OTP must match stored OTP
 * - OTP must not be expired (10 minutes)
 * - OTP must not be already used
 * - After 3 failed attempts: Lock for 1 minute
 * - After 5 failed attempts: Invalidate OTP
 * 
 * Response:
 * - Success: 200 OK with JWT token
 * - Error: 400/401/410/429 with error details
 */
export const handleVerifyOtp = async (
  request: IVerifyOtpRequest
): Promise<IVerifyOtpResponse | IErrorResponse> => {
  try {
    // Step 1: Validate OTP format
    const otpValidation = validateOtpFormat(request.otp);
    if (!otpValidation.valid) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_OTP_FORMAT,
          message: otpValidation.error,
          field: 'otp',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Step 2: Check rate limit (per phone number)
    const rateLimitExceeded = await checkRateLimit(
      `verify_otp:${request.phoneNumber}`,
      5,
      10 * 60 // 10 minutes
    );
    if (rateLimitExceeded) {
      return {
        success: false,
        error: {
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message: 'Too many requests. Please try again later',
          timestamp: new Date().toISOString(),
          retryAfter: 600 // 10 minutes
        }
      };
    }

    // Step 3: Retrieve OTP from database
    const storedOtp = await retrieveOtp(request.phoneNumber);
    if (!storedOtp) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_OTP,
          message: 'Invalid OTP. Please try again',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Step 4: Check if OTP is locked (3 failed attempts = 1 minute lockout)
    if (storedOtp.isLocked && storedOtp.lockedUntil && storedOtp.lockedUntil > new Date()) {
      return {
        success: false,
        error: {
          code: ErrorCode.OTP_LOCKOUT_1_MINUTE,
          message: 'Too many failed attempts. Please try again after 1 minute',
          timestamp: new Date().toISOString(),
          retryAfter: Math.ceil((storedOtp.lockedUntil.getTime() - Date.now()) / 1000)
        }
      };
    }

    // Step 5: Check if OTP is expired
    if (storedOtp.expiresAt < new Date()) {
      return {
        success: false,
        error: {
          code: ErrorCode.OTP_EXPIRED,
          message: 'OTP has expired. Please request a new OTP',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Step 6: Check if OTP is already used
    if (storedOtp.isUsed) {
      return {
        success: false,
        error: {
          code: ErrorCode.OTP_ALREADY_USED,
          message: 'OTP already used',
          timestamp: new Date().toISOString()
        }
      };
    }

    // Step 7: Verify OTP correctness (constant-time comparison)
    const otpMatches = constantTimeCompare(request.otp, storedOtp.otpCode);
    if (!otpMatches) {
      // Increment failed attempts
      const newFailedAttempts = storedOtp.failedAttempts + 1;

      if (newFailedAttempts >= 3) {
        // Lock OTP for 1 minute after 3 failed attempts
        await updateOtpLockout(storedOtp.id, true, new Date(Date.now() + 60 * 1000));
        
        return {
          success: false,
          error: {
            code: ErrorCode.OTP_LOCKOUT_1_MINUTE,
            message: 'Too many failed attempts. Please try again after 1 minute',
            timestamp: new Date().toISOString(),
            retryAfter: 60
          }
        };
      } else if (newFailedAttempts >= 5) {
        // Invalidate OTP after 5 failed attempts
        await invalidateOtp(storedOtp.id);
        
        return {
          success: false,
          error: {
            code: ErrorCode.TOO_MANY_ATTEMPTS,
            message: 'Too many failed attempts. Please request a new OTP',
            timestamp: new Date().toISOString()
          }
        };
      } else {
        // Update failed attempts count
        await updateOtpFailedAttempts(storedOtp.id, newFailedAttempts);
        
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_OTP,
            message: 'Invalid OTP. Please try again',
            timestamp: new Date().toISOString()
          }
        };
      }
    }

    // Step 8: OTP is correct - Mark as used
    await markOtpAsUsed(storedOtp.id);

    // Step 9: Generate JWT token
    const token = generateJwtToken(request.phoneNumber);
    const refreshToken = generateRefreshToken(request.phoneNumber);

    // Step 10: Store refresh token
    await storeRefreshToken(refreshToken);

    // Step 11: Record successful login
    await recordSuccessfulLogin(request.phoneNumber);

    return {
      success: true,
      token,
      refreshToken,
      userId: storedOtp.phoneNumber,
      expiresIn: 3600, // 1 hour in seconds
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      error: {
        code: ErrorCode.SERVER_ERROR,
        message: 'Server error. Please try again later',
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Validation Helper Functions
 */

function validatePhoneNumberFormat(phone: string): { valid: boolean; error: string } {
  const sanitized = phone.replace(/\D/g, '');

  if (!sanitized) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (sanitized.length !== 10) {
    return { valid: false, error: 'Phone number must be 10 digits' };
  }

  return { valid: true, error: '' };
}

function validateOtpFormat(otp: string): { valid: boolean; error: string } {
  const sanitized = otp.replace(/\D/g, '');

  if (!sanitized) {
    return { valid: false, error: 'OTP is required' };
  }

  if (sanitized.length !== 4) {
    return { valid: false, error: 'OTP must be 4 digits' };
  }

  return { valid: true, error: '' };
}

/**
 * Database Helper Functions (Stubs - to be implemented)
 */

async function checkRateLimit(key: string, maxAttempts: number, windowSeconds: number): Promise<boolean> {
  // TODO: Implement rate limit check in Redis or database
  return false;
}

async function recordRateLimitAttempt(key: string, windowSeconds: number): Promise<void> {
  // TODO: Implement rate limit recording in Redis or database
}

async function checkAccountStatus(phoneNumber: string): Promise<'active' | 'suspended' | 'not_found'> {
  // TODO: Implement account status check in database
  return 'active';
}

async function storeOtp(otp: IOTP): Promise<void> {
  // TODO: Implement OTP storage in database
}

async function sendOtpViaSms(phoneNumber: string, otp: string): Promise<boolean> {
  // TODO: Implement SMS sending via provider (Twilio, AWS SNS, etc.)
  // For development: Log to console
  console.log(`[DEV] OTP sent to ${phoneNumber}: ${otp}`);
  return true;
}

async function retrieveOtp(phoneNumber: string): Promise<IOTP | null> {
  // TODO: Implement OTP retrieval from database
  return null;
}

async function updateOtpLockout(otpId: string, isLocked: boolean, lockedUntil: Date): Promise<void> {
  // TODO: Implement OTP lockout update in database
}

async function updateOtpFailedAttempts(otpId: string, failedAttempts: number): Promise<void> {
  // TODO: Implement failed attempts update in database
}

async function invalidateOtp(otpId: string): Promise<void> {
  // TODO: Implement OTP invalidation in database
}

async function markOtpAsUsed(otpId: string): Promise<void> {
  // TODO: Implement mark OTP as used in database
}

async function storeRefreshToken(refreshToken: string): Promise<void> {
  // TODO: Implement refresh token storage in database
}

async function recordSuccessfulLogin(phoneNumber: string): Promise<void> {
  // TODO: Implement successful login recording in database
}

/**
 * Utility Functions
 */

function generateId(): string {
  // TODO: Implement ID generation (UUID)
  return Math.random().toString(36).substr(2, 9);
}

function generateJwtToken(phoneNumber: string): string {
  // TODO: Implement JWT token generation
  return 'jwt_token_placeholder';
}

function generateRefreshToken(phoneNumber: string): string {
  // TODO: Implement refresh token generation
  return 'refresh_token_placeholder';
}

function constantTimeCompare(a: string, b: string): boolean {
  // TODO: Implement constant-time comparison to prevent timing attacks
  return a === b;
}

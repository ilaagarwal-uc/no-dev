// Test phone numbers
export const TEST_PHONE_NUMBERS = {
  valid: '1234567890',
  invalid_short: '123456789',
  invalid_long: '12345678901',
  invalid_format: '123-456-7890',
  invalid_chars: '123abc7890',
};

// Test OTPs
export const TEST_OTPS = {
  correct: '2213',
  incorrect: '1111',
  invalid_short: '221',
  invalid_long: '22134',
  invalid_chars: '221a',
};

// Mock API responses
export const MOCK_RESPONSES = {
  generateOtpSuccess: {
    success: true,
    message: 'OTP generated successfully',
  },
  generateOtpRateLimit: {
    success: false,
    message: 'Too many OTP requests. Please try again later.',
    retryAfter: 300,
  },
  verifyOtpSuccess: {
    success: true,
    token: 'mock-jwt-token',
    userId: 'mock-user-id',
  },
  verifyOtpInvalid: {
    success: false,
    error: {
      message: 'Incorrect OTP. 2 attempts remaining.',
      code: 'INCORRECT_OTP',
      remainingAttempts: 2,
    },
  },
  verifyOtpLocked: {
    success: false,
    error: {
      message: 'OTP locked. Try again in 60 seconds.',
      code: 'OTP_LOCKED',
      lockedUntil: 60,
      remainingAttempts: 0,
    },
  },
};

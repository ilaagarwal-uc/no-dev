/**
 * Login Page - Validation Plan
 * 
 * Comprehensive validation rules for login page authentication
 * Covers frontend and backend validation, error handling, and security measures
 */

// ============================================================================
// PHONE NUMBER VALIDATION
// ============================================================================

export const phoneNumberValidation = {
  /**
   * Frontend Validation Rules
   */
  frontend: {
    lengthValidation: {
      rule: 'Phone number must be exactly 10 digits',
      lessThan10: 'Show error "Phone number must be 10 digits"',
      moreThan10: 'Show error "Phone number must be 10 digits"',
      triggers: ['On blur', 'On form submission']
    },

    formatValidation: {
      rule: 'Phone number must contain only numeric characters (0-9)',
      nonNumeric: 'Show error "Phone number must contain only digits"',
      triggers: ['On input change', 'On form submission']
    },

    requiredFieldValidation: {
      rule: 'Phone number field cannot be empty',
      empty: 'Show error "Phone number is required"',
      triggers: ['On form submission']
    },

    whitespaceHandling: {
      rule: 'Leading and trailing whitespace should be automatically trimmed',
      internalSpaces: 'Remove internal spaces (e.g., "9876 543 210" → "9876543210")',
      afterTrimming: 'Apply length and format validation'
    },

    leadingZeroHandling: {
      rule: 'Phone numbers starting with 0 are valid',
      example: '0123456789 is valid',
      noSpecialHandling: true
    }
  },

  /**
   * Backend Validation Rules
   */
  backend: {
    serverSideLengthCheck: {
      rule: 'Validate phone number is exactly 10 digits',
      invalid: 'Return HTTP 400 with error "Invalid phone number format"'
    },

    serverSideFormatCheck: {
      rule: 'Validate phone number contains only digits',
      invalid: 'Return HTTP 400 with error "Invalid phone number format"'
    },

    phoneNumberExistenceCheck: {
      rule: 'Check if phone number exists in system (optional)',
      notFound: 'Return HTTP 404 with error "Phone number not registered"'
    },

    accountStatusCheck: {
      rule: 'Check if account associated with phone number is active',
      suspended: 'Return HTTP 403 with error "Account is suspended. Please contact support"',
      deleted: 'Return HTTP 404 with error "Account not found"'
    }
  }
};

// ============================================================================
// OTP VALIDATION
// ============================================================================

export const otpValidation = {
  /**
   * Frontend Validation Rules
   */
  frontend: {
    lengthValidation: {
      rule: 'OTP must be exactly 4 digits',
      lessThan4: 'Show error "OTP must be 4 digits"',
      moreThan4: 'Show error "OTP must be 4 digits"',
      triggers: ['On blur', 'On form submission']
    },

    formatValidation: {
      rule: 'OTP must contain only numeric characters (0-9)',
      nonNumeric: 'Show error "OTP must contain only digits"',
      triggers: ['On input change', 'On form submission']
    },

    requiredFieldValidation: {
      rule: 'OTP field cannot be empty',
      empty: 'Show error "OTP is required"',
      triggers: ['On form submission']
    },

    autoSubmit: {
      rule: 'When user enters exactly 4 digits, automatically submit the form',
      benefit: 'Improves user experience for mobile users'
    },

    whitespaceHandling: {
      rule: 'Leading and trailing whitespace should be automatically trimmed',
      internalSpaces: 'Remove internal spaces',
      afterTrimming: 'Apply length and format validation'
    }
  },

  /**
   * Backend Validation Rules
   */
  backend: {
    serverSideFormatCheck: {
      rule: 'Validate OTP is exactly 4 digits',
      invalid: 'Return HTTP 400 with error "Invalid OTP format"'
    },

    otpExistenceCheck: {
      rule: 'Check if OTP exists in the system for the given phone number',
      notFound: 'Return HTTP 404 with error "OTP not found. Please request a new OTP"'
    },

    otpExpirationCheck: {
      rule: 'Check if OTP has expired (10-minute expiration)',
      expired: 'Return HTTP 410 with error "OTP has expired. Please request a new OTP"',
      includeTimestamp: 'Include timestamp of when OTP was sent for debugging'
    },

    otpCorrectnessCheck: {
      rule: 'Compare provided OTP with stored OTP using constant-time comparison',
      incorrect: 'Return HTTP 401 with error "Invalid OTP. Please try again"',
      security: 'Do NOT reveal whether OTP is incorrect or expired'
    },

    otpAttemptTracking: {
      rule: 'Track number of failed OTP verification attempts',
      after3Attempts: 'Lock OTP for 1 minute',
      after5Attempts: 'Invalidate OTP completely'
    }
  }
};

// ============================================================================
// OTP LOCKOUT VALIDATION (3 Failed Attempts = 1 Minute Lock)
// ============================================================================

export const otpLockoutValidation = {
  /**
   * Frontend Lockout Rules
   */
  frontend: {
    firstFailedAttempt: {
      rule: 'After 1 failed attempt',
      display: 'Show error "Invalid OTP. 2 attempts remaining"',
      state: 'OTP input enabled, can retry'
    },

    secondFailedAttempt: {
      rule: 'After 2 failed attempts',
      display: 'Show error "Invalid OTP. 1 attempt remaining"',
      state: 'OTP input enabled, can retry'
    },

    thirdFailedAttempt: {
      rule: 'After 3 failed attempts',
      display: 'Show error "Too many failed attempts. Please try again in 60 seconds"',
      state: 'OTP input disabled, button disabled, countdown timer visible',
      lockDuration: '1 minute (60 seconds)'
    },

    countdownTimer: {
      rule: 'Display countdown timer during lockout',
      format: 'Show "Please try again in 59 seconds", "58 seconds", etc.',
      decrement: 'Decrement every second',
      autoUnlock: 'When timer reaches 0, automatically unlock OTP input'
    },

    automaticUnlock: {
      rule: 'After 1 minute lockout expires',
      action: 'Automatically unlock OTP input field',
      enableButton: 'Enable "Verify OTP" button',
      clearTimer: 'Remove countdown timer',
      allowRetry: 'User can retry with new OTP attempt'
    },

    fourthFailedAttempt: {
      rule: 'After 4 failed attempts (after unlock)',
      display: 'Show error "Invalid OTP. Please try again"',
      state: 'OTP input enabled, can retry',
      tracking: 'Failed attempts counter continues (now 4 total)'
    },

    fifthFailedAttempt: {
      rule: 'After 5 failed attempts',
      display: 'Show error "Too many failed attempts. Please request a new OTP"',
      state: 'OTP permanently invalidated',
      action: 'Force user to go back and request new OTP'
    }
  },

  /**
   * Backend Lockout Rules
   */
  backend: {
    lockoutAfter3Attempts: {
      rule: 'After 3 failed OTP verification attempts',
      action: 'Lock OTP for 1 minute',
      response: 'Return HTTP 429 with error "Too many failed attempts. Please try again after 1 minute"',
      includeRetryAfter: 'Include retryAfter: 60 (seconds) in response'
    },

    lockoutCheck: {
      rule: 'Before verifying OTP, check if OTP is locked',
      isLocked: 'Return HTTP 429 with error "Too many failed attempts. Please try again after X seconds"',
      includeRemaining: 'Include remaining lockout time in response'
    },

    invalidateAfter5Attempts: {
      rule: 'After 5 failed attempts',
      action: 'Permanently invalidate OTP',
      response: 'Return HTTP 429 with error "Too many failed attempts. Please request a new OTP"'
    },

    failedAttemptsTracking: {
      rule: 'Track failed attempts per OTP',
      storage: 'Store in database with timestamp',
      persistence: 'Lockout persists across page refreshes'
    }
  }
};

// ============================================================================
// RATE LIMITING VALIDATION
// ============================================================================

export const rateLimitingValidation = {
  /**
   * Send OTP Rate Limiting
   */
  sendOtpRateLimit: {
    perPhoneLimit: {
      rule: 'Maximum 3 OTP send requests per phone number per 10 minutes',
      exceeded: 'Block further requests for 5 minutes',
      response: 'Return HTTP 429 with error "Too many attempts. Please wait 5 minutes before trying again"',
      includeRetryAfter: 'Include retryAfter: 300 (seconds) in response'
    },

    perIpLimit: {
      rule: 'Maximum 10 OTP send requests per IP address per hour',
      exceeded: 'Block further requests for 1 hour',
      response: 'Return HTTP 429 with error "Too many requests from your IP. Please try again later"'
    },

    rateLimitHeaders: {
      rule: 'Include rate limit information in response headers',
      headers: [
        'X-RateLimit-Limit: 3',
        'X-RateLimit-Remaining: 2',
        'X-RateLimit-Reset: 1709529600 (Unix timestamp)'
      ]
    },

    rateLimitStorage: {
      rule: 'Store rate limit data in Redis or in-memory cache',
      keyFormat: 'rate_limit:send_otp:{phone_number} and rate_limit:send_otp:ip:{ip_address}',
      expiration: 'Automatically expire after time window'
    }
  },

  /**
   * Verify OTP Rate Limiting
   */
  verifyOtpRateLimit: {
    perPhoneLimit: {
      rule: 'Maximum 5 OTP verification attempts per phone number per 10 minutes',
      exceeded: 'Block further requests',
      response: 'Return HTTP 429 with error "Too many requests. Please try again later"'
    },

    perIpLimit: {
      rule: 'Maximum 20 OTP verification attempts per IP address per hour',
      exceeded: 'Block further requests for 1 hour',
      response: 'Return HTTP 429 with error "Too many requests from your IP. Please try again later"'
    }
  }
};

// ============================================================================
// BRUTE FORCE PROTECTION
// ============================================================================

export const bruteForceProtection = {
  /**
   * OTP Brute Force Protection
   */
  otpBruteForce: {
    failedAttemptTracking: {
      rule: 'Track failed OTP verification attempts per phone number',
      storage: 'Store in database or cache with timestamp',
      keyFormat: 'brute_force:otp:{phone_number}'
    },

    progressiveLockout: {
      after1Attempt: 'Show warning "Invalid OTP. 2 attempts remaining"',
      after2Attempts: 'Show warning "Invalid OTP. 1 attempt remaining"',
      after3Attempts: 'Lock OTP for 1 minute',
      after5Attempts: 'Invalidate OTP and require new request'
    },

    lockoutDuration: {
      after3Attempts: 'Lock for 1 minute',
      after5Attempts: 'Permanently invalidate OTP'
    },

    bruteForceDetectionLogging: {
      rule: 'Log all brute force attempts',
      logData: [
        'Phone number (hashed for privacy)',
        'IP address',
        'Timestamp',
        'Number of attempts',
        'User agent'
      ],
      alerting: 'Alert security team if suspicious pattern detected (e.g., 100+ attempts in 1 hour)'
    }
  },

  /**
   * Phone Number Enumeration Protection
   */
  phoneEnumerationProtection: {
    consistentResponseTimes: {
      rule: 'Ensure response time is consistent regardless of whether phone number exists',
      implementation: 'Use constant-time comparison to prevent timing attacks',
      addDelay: 'Add random delay (50-200ms) to responses'
    },

    genericErrorMessages: {
      rule: 'Do NOT reveal whether phone number exists in system',
      message: 'Use generic error message: "If this phone number is registered, you will receive an OTP"',
      benefit: 'Prevents attackers from enumerating valid phone numbers'
    }
  }
};

// ============================================================================
// NETWORK ERROR HANDLING
// ============================================================================

export const networkErrorHandling = {
  /**
   * Frontend Network Error Handling
   */
  frontend: {
    networkTimeout: {
      rule: 'Set request timeout to 10 seconds',
      timeout: 'Show error "Request timed out. Please check your connection and try again"',
      action: 'Allow user to retry'
    },

    connectionError: {
      rule: 'If network connection is lost',
      display: 'Show error "Network error. Please check your connection and try again"',
      action: 'Allow user to retry',
      autoRetry: 'Automatically retry when connection is restored'
    },

    serverError5xx: {
      rule: 'If server returns 500, 502, 503, 504',
      display: 'Show error "Server error. Please try again later"',
      includeCode: 'Include error code for debugging: "Error code: 500"',
      action: 'Allow user to retry'
    },

    clientError4xx: {
      rule: 'If server returns 400, 401, 403, 404',
      display: 'Show specific error message from server',
      dontShow: 'Do NOT show generic error message',
      action: 'Allow user to retry (except for 403 Forbidden)'
    },

    corsError: {
      rule: 'If CORS error occurs',
      display: 'Show error "Unable to connect to server. Please try again"',
      logging: 'Log CORS error for debugging',
      dontExpose: 'Do NOT expose CORS details to user'
    },

    offlineMode: {
      rule: 'Detect if user is offline',
      display: 'Show error "You are offline. Please check your connection"',
      autoRetry: 'Automatically retry when connection is restored',
      storage: 'Store last attempted action for retry'
    }
  },

  /**
   * Backend Network Error Handling
   */
  backend: {
    externalApiTimeout: {
      rule: 'If external API (e.g., SMS provider) times out',
      response: 'Return HTTP 504 with error "Service temporarily unavailable. Please try again"',
      retry: 'Retry with exponential backoff (1s, 2s, 4s, 8s)',
      maxRetries: 'After 3 retries: Return error to client'
    },

    databaseConnectionError: {
      rule: 'If database connection fails',
      response: 'Return HTTP 503 with error "Service temporarily unavailable. Please try again"',
      logging: 'Log error with full stack trace for debugging',
      alerting: 'Alert DevOps team'
    }
  }
};

// ============================================================================
// OTP EXPIRATION VALIDATION
// ============================================================================

export const otpExpirationValidation = {
  otpValidityPeriod: {
    rule: 'OTP is valid for exactly 10 minutes from generation',
    expiration: 'After 10 minutes: OTP is automatically invalidated',
    storage: 'Timestamp stored: otp_created_at and otp_expires_at'
  },

  expirationCheck: {
    rule: 'Before verifying OTP: Check if current time > otp_expires_at',
    expired: 'Return HTTP 410 with error "OTP has expired. Please request a new OTP"'
  },

  expirationNotification: {
    rule: 'When OTP is about to expire (within 1 minute)',
    display: 'Show warning "OTP expires in 1 minute"',
    timer: 'Display countdown timer showing remaining time',
    action: 'Allow user to request new OTP'
  },

  automaticCleanup: {
    rule: 'Expired OTPs are automatically deleted from database after 24 hours',
    schedule: 'Use scheduled job (cron) to clean up expired OTPs',
    frequency: 'Run cleanup every hour'
  },

  otpReusePreventio: {
    rule: 'Once OTP is used successfully: Mark as used = true',
    reuse: 'If user tries to use same OTP again: Return HTTP 401 with error "OTP already used"'
  }
};

// ============================================================================
// SESSION TOKEN VALIDATION
// ============================================================================

export const sessionTokenValidation = {
  /**
   * Token Generation
   */
  tokenGeneration: {
    format: {
      rule: 'Use JWT (JSON Web Token) format',
      payload: '{ phone_number, user_id, iat, exp }',
      algorithm: 'Sign with RS256 algorithm (asymmetric)',
      keyId: 'Include kid (key ID) in header for key rotation'
    },

    expiration: {
      accessToken: 'Expires in 1 hour',
      refreshToken: 'Expires in 30 days',
      includeExp: 'Include exp claim in token'
    },

    signing: {
      rule: 'Sign token with private key stored securely',
      keyStrength: 'Use strong key (RSA 2048-bit minimum)',
      rotation: 'Rotate keys every 90 days'
    }
  },

  /**
   * Token Validation
   */
  tokenValidation: {
    verification: {
      rule: 'Verify token signature using public key',
      checks: [
        'Verify token has not expired',
        'Verify token has required claims',
        'If invalid: Return HTTP 401 with error "Invalid or expired token"'
      ]
    },

    tokenRefresh: {
      rule: 'When access token is about to expire (within 5 minutes)',
      action: 'Automatically refresh',
      method: 'Use refresh token to obtain new access token',
      response: 'Return new access token to client',
      update: 'Update token in local storage and cookies'
    },

    tokenRevocation: {
      rule: 'When user logs out: Add token to blacklist',
      storage: 'Store blacklisted tokens in Redis with expiration',
      check: 'Check blacklist before accepting token',
      blacklisted: 'If token is blacklisted: Return HTTP 401 with error "Token has been revoked"'
    }
  }
};

// ============================================================================
// CSRF PROTECTION
// ============================================================================

export const csrfProtection = {
  csrfTokenGeneration: {
    rule: 'Generate unique CSRF token for each session',
    storage: 'Store in secure HTTP-only cookie',
    response: 'Include in response body for client to use'
  },

  csrfTokenValidation: {
    rule: 'For POST requests: Require CSRF token in request header or body',
    comparison: 'Compare token from request with token in cookie',
    invalid: 'If tokens don\'t match: Return HTTP 403 with error "CSRF token validation failed"'
  },

  csrfTokenRotation: {
    afterLogin: 'Rotate CSRF token after successful login',
    afterLogout: 'Rotate CSRF token after logout',
    periodic: 'Rotate CSRF token every 1 hour'
  }
};

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

export const inputSanitization = {
  phoneNumberSanitization: {
    removeNonNumeric: 'Remove all non-numeric characters',
    trim: 'Trim leading and trailing whitespace',
    convert: 'Convert to string type',
    validate: 'Validate length and format after sanitization'
  },

  otpSanitization: {
    removeNonNumeric: 'Remove all non-numeric characters',
    trim: 'Trim leading and trailing whitespace',
    convert: 'Convert to string type',
    validate: 'Validate length and format after sanitization'
  },

  sqlInjectionPrevention: {
    rule: 'Use parameterized queries for all database operations',
    dontConcat: 'Never concatenate user input into SQL queries',
    useOrm: 'Use ORM (e.g., Mongoose for MongoDB) to prevent injection'
  },

  xssPrevention: {
    escape: 'Escape all user input before displaying in HTML',
    react: 'Use React\'s built-in XSS protection (automatic escaping)',
    csp: 'Use Content Security Policy (CSP) headers'
  }
};

// ============================================================================
// ERROR RESPONSE FORMAT
// ============================================================================

export const errorResponseFormat = {
  standardErrorResponse: {
    structure: {
      success: false,
      error: {
        code: 'ERROR_CODE',
        message: 'User-friendly error message',
        field: 'Field name (optional)',
        timestamp: 'ISO 8601 timestamp',
        retryAfter: 'Seconds to wait before retry (optional)'
      }
    }
  },

  errorCodes: [
    { code: 'INVALID_PHONE_FORMAT', status: 400, message: 'Phone number must be 10 digits', action: 'Correct phone number' },
    { code: 'PHONE_REQUIRED', status: 400, message: 'Phone number is required', action: 'Enter phone number' },
    { code: 'INVALID_OTP_FORMAT', status: 400, message: 'OTP must be 4 digits', action: 'Correct OTP' },
    { code: 'OTP_REQUIRED', status: 400, message: 'OTP is required', action: 'Enter OTP' },
    { code: 'INVALID_OTP', status: 401, message: 'Invalid OTP. Please try again', action: 'Retry with correct OTP' },
    { code: 'OTP_EXPIRED', status: 410, message: 'OTP has expired. Please request a new OTP', action: 'Request new OTP' },
    { code: 'OTP_ALREADY_USED', status: 401, message: 'OTP already used', action: 'Request new OTP' },
    { code: 'OTP_LOCKOUT_1_MINUTE', status: 429, message: 'Too many failed attempts. Please try again after 1 minute', action: 'Wait and retry' },
    { code: 'TOO_MANY_ATTEMPTS', status: 429, message: 'Too many attempts. Please wait 5 minutes', action: 'Wait and retry' },
    { code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Too many requests. Please try again later', action: 'Wait and retry' },
    { code: 'ACCOUNT_SUSPENDED', status: 403, message: 'Account is suspended. Please contact support', action: 'Contact support' },
    { code: 'ACCOUNT_NOT_FOUND', status: 404, message: 'Account not found', action: 'Register account' },
    { code: 'SERVER_ERROR', status: 500, message: 'Server error. Please try again later', action: 'Retry later' },
    { code: 'SERVICE_UNAVAILABLE', status: 503, message: 'Service temporarily unavailable', action: 'Retry later' }
  ]
};

// ============================================================================
// VALIDATION SUMMARY
// ============================================================================

export const validationSummary = {
  phoneValidation: {
    frontend: true,
    backend: true,
    errorMessage: 'Phone number must be 10 digits',
    httpStatus: 400
  },

  otpValidation: {
    frontend: true,
    backend: true,
    errorMessage: 'OTP must be 4 digits',
    httpStatus: 400
  },

  otpCorrectness: {
    frontend: false,
    backend: true,
    errorMessage: 'Invalid OTP. Please try again',
    httpStatus: 401
  },

  otpExpiration: {
    frontend: false,
    backend: true,
    errorMessage: 'OTP has expired. Please request a new OTP',
    httpStatus: 410
  },

  otpLockout: {
    frontend: true,
    backend: true,
    errorMessage: 'Too many failed attempts. Please try again after 1 minute',
    httpStatus: 429
  },

  rateLimiting: {
    frontend: false,
    backend: true,
    errorMessage: 'Too many attempts. Please wait 5 minutes',
    httpStatus: 429
  },

  bruteForceProtection: {
    frontend: true,
    backend: true,
    errorMessage: 'Too many failed attempts. Please request a new OTP',
    httpStatus: 429
  },

  networkError: {
    frontend: true,
    backend: false,
    errorMessage: 'Network error. Please check your connection',
    httpStatus: null
  },

  serverError: {
    frontend: true,
    backend: false,
    errorMessage: 'Server error. Please try again later',
    httpStatus: 500
  },

  csrfToken: {
    frontend: false,
    backend: true,
    errorMessage: 'CSRF token validation failed',
    httpStatus: 403
  }
};

// ============================================================================
// SECURITY BEST PRACTICES
// ============================================================================

export const securityBestPractices = [
  {
    practice: 'Never Log Sensitive Data',
    rules: [
      'Do NOT log phone numbers in plain text',
      'Do NOT log OTPs in plain text',
      'Hash sensitive data before logging',
      'Example: Log phone_hash: sha256(phone_number)'
    ]
  },
  {
    practice: 'Use HTTPS Only',
    rules: [
      'All API endpoints must use HTTPS',
      'Redirect HTTP to HTTPS',
      'Use HSTS (HTTP Strict-Transport-Security) header'
    ]
  },
  {
    practice: 'Secure Token Storage',
    rules: [
      'Store tokens in secure HTTP-only cookies',
      'Also store in local storage for client-side access',
      'Set cookie flags: HttpOnly, Secure, SameSite=Strict'
    ]
  },
  {
    practice: 'Constant-Time Comparison',
    rules: [
      'Use constant-time comparison for OTP verification',
      'Prevents timing attacks',
      'Example: Use crypto.timingSafeEqual() in Node.js'
    ]
  },
  {
    practice: 'Rate Limiting',
    rules: [
      'Implement rate limiting at multiple levels',
      'Per phone number, per IP address, per user account',
      'Use exponential backoff for retries'
    ]
  },
  {
    practice: 'Monitoring and Alerting',
    rules: [
      'Monitor failed login attempts',
      'Alert on suspicious patterns (e.g., 100+ attempts in 1 hour)',
      'Log all security events with timestamp and IP address'
    ]
  }
];

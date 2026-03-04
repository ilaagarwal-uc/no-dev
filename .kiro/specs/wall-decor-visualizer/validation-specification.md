# Login Page - Validation Specification

## Overview

This document details all validation rules, error handling, and security measures implemented for the login page authentication flow.

---

## 1. Phone Number Validation

### Frontend Validation (Client-Side)

**Rule 1.1: Length Validation**
- Phone number must be exactly 10 digits
- If less than 10 digits: Show error "Phone number must be 10 digits"
- If more than 10 digits: Show error "Phone number must be 10 digits"
- Validation triggers: On blur, on form submission

**Rule 1.2: Format Validation**
- Phone number must contain only numeric characters (0-9)
- No letters, special characters, or spaces allowed
- If non-numeric characters detected: Show error "Phone number must contain only digits"
- Validation triggers: On input change, on form submission

**Rule 1.3: Required Field Validation**
- Phone number field cannot be empty
- If empty on submission: Show error "Phone number is required"
- Validation triggers: On form submission

**Rule 1.4: Whitespace Handling**
- Leading and trailing whitespace should be automatically trimmed
- Internal spaces should be removed (e.g., "9876 543 210" → "9876543210")
- After trimming, apply length and format validation

**Rule 1.5: Leading Zero Handling**
- Phone numbers starting with 0 are valid (e.g., "0123456789")
- No special handling needed - treat as normal 10-digit number

### Backend Validation (Server-Side)

**Rule 1.6: Server-Side Length Check**
- Validate phone number is exactly 10 digits
- If invalid: Return HTTP 400 with error message "Invalid phone number format"

**Rule 1.7: Server-Side Format Check**
- Validate phone number contains only digits
- If invalid: Return HTTP 400 with error message "Invalid phone number format"

**Rule 1.8: Phone Number Existence Check**
- Check if phone number exists in the system (optional - for future user registration)
- If not found: Return HTTP 404 with error message "Phone number not registered"

**Rule 1.9: Account Status Check**
- Check if account associated with phone number is active
- If account is suspended/blocked: Return HTTP 403 with error message "Account is suspended. Please contact support"
- If account is deleted: Return HTTP 404 with error message "Account not found"

---

## 2. OTP Validation

### Frontend Validation (Client-Side)

**Rule 2.1: OTP Length Validation**
- OTP must be exactly 4 digits
- If less than 4 digits: Show error "OTP must be 4 digits"
- If more than 4 digits: Show error "OTP must be 4 digits"
- Validation triggers: On blur, on form submission

**Rule 2.2: OTP Format Validation**
- OTP must contain only numeric characters (0-9)
- No letters, special characters, or spaces allowed
- If non-numeric characters detected: Show error "OTP must contain only digits"
- Validation triggers: On input change, on form submission

**Rule 2.3: OTP Required Field Validation**
- OTP field cannot be empty
- If empty on submission: Show error "OTP is required"
- Validation triggers: On form submission

**Rule 2.4: OTP Auto-Submit**
- When user enters exactly 4 digits, automatically submit the form
- No need to click "Verify OTP" button
- Improves user experience for mobile users

**Rule 2.5: OTP Whitespace Handling**
- Leading and trailing whitespace should be automatically trimmed
- Internal spaces should be removed
- After trimming, apply length and format validation

### Backend Validation (Server-Side)

**Rule 2.6: Server-Side OTP Format Check**
- Validate OTP is exactly 4 digits
- If invalid: Return HTTP 400 with error message "Invalid OTP format"

**Rule 2.7: OTP Existence Check**
- Check if OTP exists in the system for the given phone number
- If OTP not found: Return HTTP 404 with error message "OTP not found. Please request a new OTP"

**Rule 2.8: OTP Expiration Check**
- Check if OTP has expired (10-minute expiration)
- If expired: Return HTTP 410 with error message "OTP has expired. Please request a new OTP"
- Include timestamp of when OTP was sent for debugging

**Rule 2.9: OTP Correctness Check**
- Compare provided OTP with stored OTP
- If incorrect: Return HTTP 401 with error message "Invalid OTP. Please try again"
- Do NOT reveal whether OTP is incorrect or expired (security best practice)

**Rule 2.10: OTP Attempt Tracking**
- Track number of failed OTP verification attempts
- After 5 failed attempts: Invalidate the OTP
- Return HTTP 429 with error message "Too many failed attempts. Please request a new OTP"

---

## 3. Rate Limiting

### Send OTP Rate Limiting

**Rule 3.1: Per-Phone Rate Limit**
- Maximum 3 OTP send requests per phone number per 10 minutes
- After 3rd attempt: Block further requests for 5 minutes
- Return HTTP 429 with error message "Too many attempts. Please wait 5 minutes before trying again"
- Include countdown timer in response: `{ retryAfter: 300 }` (seconds)

**Rule 3.2: Per-IP Rate Limit**
- Maximum 10 OTP send requests per IP address per hour
- After 10th attempt: Block further requests for 1 hour
- Return HTTP 429 with error message "Too many requests from your IP. Please try again later"

**Rule 3.3: Rate Limit Headers**
- Include rate limit information in response headers:
  - `X-RateLimit-Limit: 3`
  - `X-RateLimit-Remaining: 2`
  - `X-RateLimit-Reset: 1709529600` (Unix timestamp)

**Rule 3.4: Rate Limit Storage**
- Store rate limit data in Redis or in-memory cache
- Key format: `rate_limit:send_otp:{phone_number}` and `rate_limit:send_otp:ip:{ip_address}`
- Automatically expire after time window

### Verify OTP Rate Limiting

**Rule 3.5: Per-Phone Verification Limit**
- Maximum 5 OTP verification attempts per phone number per 10 minutes
- After 5th failed attempt: Invalidate the OTP
- Return HTTP 429 with error message "Too many failed attempts. Please request a new OTP"

**Rule 3.6: Per-IP Verification Limit**
- Maximum 20 OTP verification attempts per IP address per hour
- After 20th attempt: Block further requests for 1 hour
- Return HTTP 429 with error message "Too many requests from your IP. Please try again later"

---

## 4. Brute Force Protection

### OTP Brute Force Protection

**Rule 4.1: Failed Attempt Tracking**
- Track failed OTP verification attempts per phone number
- Store in database or cache with timestamp
- Key format: `brute_force:otp:{phone_number}`

**Rule 4.2: Progressive Lockout**
- After 3 failed attempts: Show warning "2 attempts remaining"
- After 4 failed attempts: Show warning "1 attempt remaining"
- After 5 failed attempts: Invalidate OTP and require new request
- Return HTTP 429 with error message "Too many failed attempts. Please request a new OTP"

**Rule 4.3: Lockout Duration**
- After OTP is invalidated due to brute force: Lock for 15 minutes
- User must wait 15 minutes before requesting new OTP
- Return HTTP 429 with error message "Please wait 15 minutes before requesting a new OTP"

**Rule 4.4: Brute Force Detection Logging**
- Log all brute force attempts with:
  - Phone number (hashed for privacy)
  - IP address
  - Timestamp
  - Number of attempts
  - User agent
- Alert security team if suspicious pattern detected (e.g., 100+ attempts in 1 hour)

### Phone Number Enumeration Protection

**Rule 4.5: Consistent Response Times**
- Ensure response time is consistent regardless of whether phone number exists
- Use constant-time comparison to prevent timing attacks
- Add random delay (50-200ms) to responses to prevent timing analysis

**Rule 4.6: Generic Error Messages**
- Do NOT reveal whether phone number exists in system
- Use generic error message: "If this phone number is registered, you will receive an OTP"
- This prevents attackers from enumerating valid phone numbers

---

## 5. Network Error Handling

### Frontend Network Error Handling

**Rule 5.1: Network Timeout**
- Set request timeout to 10 seconds
- If request times out: Show error "Request timed out. Please check your connection and try again"
- Allow user to retry

**Rule 5.2: Connection Error**
- If network connection is lost: Show error "Network error. Please check your connection and try again"
- Allow user to retry
- Automatically retry when connection is restored

**Rule 5.3: Server Error (5xx)**
- If server returns 500, 502, 503, 504: Show error "Server error. Please try again later"
- Include error code for debugging: "Error code: 500"
- Allow user to retry

**Rule 5.4: Client Error (4xx)**
- If server returns 400, 401, 403, 404: Show specific error message from server
- Do NOT show generic error message
- Allow user to retry (except for 403 Forbidden)

**Rule 5.5: CORS Error**
- If CORS error occurs: Show error "Unable to connect to server. Please try again"
- Log CORS error for debugging
- Do NOT expose CORS details to user

**Rule 5.6: Offline Mode**
- Detect if user is offline (no internet connection)
- Show error "You are offline. Please check your connection"
- Automatically retry when connection is restored
- Store last attempted action for retry

### Backend Network Error Handling

**Rule 5.7: External API Timeout**
- If external API (e.g., SMS provider) times out: Return HTTP 504 with error message "Service temporarily unavailable. Please try again"
- Retry with exponential backoff (1s, 2s, 4s, 8s)
- After 3 retries: Return error to client

**Rule 5.8: Database Connection Error**
- If database connection fails: Return HTTP 503 with error message "Service temporarily unavailable. Please try again"
- Log error with full stack trace for debugging
- Alert DevOps team

---

## 6. OTP Expiration

### OTP Expiration Rules

**Rule 6.1: OTP Validity Period**
- OTP is valid for exactly 10 minutes from generation
- After 10 minutes: OTP is automatically invalidated
- Timestamp stored: `otp_created_at` and `otp_expires_at`

**Rule 6.2: Expiration Check**
- Before verifying OTP: Check if current time > `otp_expires_at`
- If expired: Return HTTP 410 with error message "OTP has expired. Please request a new OTP"

**Rule 6.3: Expiration Notification**
- When OTP is about to expire (within 1 minute): Show warning "OTP expires in 1 minute"
- Display countdown timer showing remaining time
- Allow user to request new OTP

**Rule 6.4: Automatic Cleanup**
- Expired OTPs are automatically deleted from database after 24 hours
- Use scheduled job (cron) to clean up expired OTPs
- Run cleanup every hour

**Rule 6.5: OTP Reuse Prevention**
- Once OTP is used successfully: Mark as `used = true`
- If user tries to use same OTP again: Return HTTP 401 with error message "OTP already used"

---

## 7. Session Token Validation

### Token Generation

**Rule 7.1: Token Format**
- Use JWT (JSON Web Token) format
- Include payload: `{ phone_number, user_id, iat, exp }`
- Sign with RS256 algorithm (asymmetric)
- Include `kid` (key ID) in header for key rotation

**Rule 7.2: Token Expiration**
- Access token expires in 1 hour
- Refresh token expires in 30 days
- Include `exp` claim in token

**Rule 7.3: Token Signing**
- Sign token with private key stored securely
- Use strong key (RSA 2048-bit minimum)
- Rotate keys every 90 days

### Token Validation

**Rule 7.4: Token Verification**
- Verify token signature using public key
- Verify token has not expired
- Verify token has required claims
- If invalid: Return HTTP 401 with error message "Invalid or expired token"

**Rule 7.5: Token Refresh**
- When access token is about to expire (within 5 minutes): Automatically refresh
- Use refresh token to obtain new access token
- Return new access token to client
- Update token in local storage and cookies

**Rule 7.6: Token Revocation**
- When user logs out: Add token to blacklist
- Store blacklisted tokens in Redis with expiration
- Check blacklist before accepting token
- If token is blacklisted: Return HTTP 401 with error message "Token has been revoked"

---

## 8. CSRF Protection

**Rule 8.1: CSRF Token Generation**
- Generate unique CSRF token for each session
- Store in secure HTTP-only cookie
- Include in response body for client to use

**Rule 8.2: CSRF Token Validation**
- For POST requests: Require CSRF token in request header or body
- Compare token from request with token in cookie
- If tokens don't match: Return HTTP 403 with error message "CSRF token validation failed"

**Rule 8.3: CSRF Token Rotation**
- Rotate CSRF token after successful login
- Rotate CSRF token after logout
- Rotate CSRF token every 1 hour

---

## 9. Input Sanitization

**Rule 9.1: Phone Number Sanitization**
- Remove all non-numeric characters
- Trim leading and trailing whitespace
- Convert to string type
- Validate length and format after sanitization

**Rule 9.2: OTP Sanitization**
- Remove all non-numeric characters
- Trim leading and trailing whitespace
- Convert to string type
- Validate length and format after sanitization

**Rule 9.3: SQL Injection Prevention**
- Use parameterized queries for all database operations
- Never concatenate user input into SQL queries
- Use ORM (e.g., Mongoose for MongoDB) to prevent injection

**Rule 9.4: XSS Prevention**
- Escape all user input before displaying in HTML
- Use React's built-in XSS protection (automatic escaping)
- Use Content Security Policy (CSP) headers

---

## 10. Error Response Format

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PHONE_FORMAT",
    "message": "Phone number must be 10 digits",
    "field": "phone_number",
    "timestamp": "2026-03-04T10:30:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Message | User Action |
|------|-------------|---------|-------------|
| INVALID_PHONE_FORMAT | 400 | Phone number must be 10 digits | Correct phone number |
| PHONE_REQUIRED | 400 | Phone number is required | Enter phone number |
| INVALID_OTP_FORMAT | 400 | OTP must be 4 digits | Correct OTP |
| OTP_REQUIRED | 400 | OTP is required | Enter OTP |
| INVALID_OTP | 401 | Invalid OTP. Please try again | Retry with correct OTP |
| OTP_EXPIRED | 410 | OTP has expired. Please request a new OTP | Request new OTP |
| OTP_ALREADY_USED | 401 | OTP already used | Request new OTP |
| TOO_MANY_ATTEMPTS | 429 | Too many attempts. Please wait 5 minutes | Wait and retry |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests. Please try again later | Wait and retry |
| ACCOUNT_SUSPENDED | 403 | Account is suspended. Please contact support | Contact support |
| ACCOUNT_NOT_FOUND | 404 | Account not found | Register account |
| SERVER_ERROR | 500 | Server error. Please try again later | Retry later |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable | Retry later |



---

## 11. Validation Summary Table

| Validation Type | Frontend | Backend | Error Message | HTTP Status |
|-----------------|----------|---------|---------------|-------------|
| Phone Length | ✓ | ✓ | Phone number must be 10 digits | 400 |
| Phone Format | ✓ | ✓ | Phone number must contain only digits | 400 |
| Phone Required | ✓ | ✓ | Phone number is required | 400 |
| OTP Length | ✓ | ✓ | OTP must be 4 digits | 400 |
| OTP Format | ✓ | ✓ | OTP must contain only digits | 400 |
| OTP Required | ✓ | ✓ | OTP is required | 400 |
| OTP Correctness | ✗ | ✓ | Invalid OTP. Please try again | 401 |
| OTP Expiration | ✗ | ✓ | OTP has expired. Please request a new OTP | 410 |
| OTP Reuse | ✗ | ✓ | OTP already used | 401 |
| Rate Limit (Send) | ✗ | ✓ | Too many attempts. Please wait 5 minutes | 429 |
| Rate Limit (Verify) | ✗ | ✓ | Too many failed attempts. Please request a new OTP | 429 |
| Brute Force | ✗ | ✓ | Too many failed attempts. Please request a new OTP | 429 |
| Account Status | ✗ | ✓ | Account is suspended. Please contact support | 403 |
| Network Error | ✓ | ✗ | Network error. Please check your connection | - |
| Server Error | ✓ | ✗ | Server error. Please try again later | 500 |
| CSRF Token | ✗ | ✓ | CSRF token validation failed | 403 |

---

## 12. Validation Flow Diagram

### Phone Number Entry Flow

```
User enters phone number
    ↓
Frontend: Length check (10 digits?)
    ├─ NO → Show error "Phone number must be 10 digits"
    └─ YES ↓
Frontend: Format check (only digits?)
    ├─ NO → Show error "Phone number must contain only digits"
    └─ YES ↓
Frontend: Required check (not empty?)
    ├─ NO → Show error "Phone number is required"
    └─ YES ↓
User clicks "Send OTP"
    ↓
Frontend: Sanitize (trim, remove spaces)
    ↓
Frontend: Show loading state
    ↓
Backend: Receive request
    ↓
Backend: Rate limit check (per phone, per IP)
    ├─ EXCEEDED → Return 429 "Too many attempts"
    └─ OK ↓
Backend: Phone format validation
    ├─ INVALID → Return 400 "Invalid phone format"
    └─ VALID ↓
Backend: Account status check
    ├─ SUSPENDED → Return 403 "Account suspended"
    ├─ NOT FOUND → Return 404 "Account not found"
    └─ ACTIVE ↓
Backend: Generate OTP (2213)
    ↓
Backend: Store OTP with 10-minute expiration
    ↓
Backend: Send SMS with OTP
    ├─ FAILED → Return 503 "Service unavailable"
    └─ SUCCESS ↓
Backend: Return 200 "OTP sent"
    ↓
Frontend: Hide loading state
    ↓
Frontend: Show success message "OTP sent to your phone"
    ↓
Frontend: Transition to OTP verification step
```

### OTP Verification Flow

```
User enters OTP
    ↓
Frontend: Length check (4 digits?)
    ├─ NO → Show error "OTP must be 4 digits"
    └─ YES ↓
Frontend: Format check (only digits?)
    ├─ NO → Show error "OTP must contain only digits"
    └─ YES ↓
Frontend: Required check (not empty?)
    ├─ NO → Show error "OTP is required"
    └─ YES ↓
User clicks "Verify OTP" (or auto-submit after 4 digits)
    ↓
Frontend: Sanitize (trim, remove spaces)
    ↓
Frontend: Show loading state
    ↓
Backend: Receive request
    ↓
Backend: Rate limit check (per phone, per IP)
    ├─ EXCEEDED → Return 429 "Too many attempts"
    └─ OK ↓
Backend: OTP format validation
    ├─ INVALID → Return 400 "Invalid OTP format"
    └─ VALID ↓
Backend: OTP existence check
    ├─ NOT FOUND → Return 404 "OTP not found"
    └─ FOUND ↓
Backend: OTP expiration check
    ├─ EXPIRED → Return 410 "OTP expired"
    └─ VALID ↓
Backend: OTP correctness check
    ├─ INCORRECT → Increment failed attempts
    │   ├─ 5 attempts reached → Invalidate OTP, Return 429 "Too many attempts"
    │   └─ < 5 attempts → Return 401 "Invalid OTP"
    └─ CORRECT ↓
Backend: Mark OTP as used
    ↓
Backend: Generate session token (JWT)
    ↓
Backend: Store token in database
    ↓
Backend: Return 200 with token
    ↓
Frontend: Hide loading state
    ↓
Frontend: Store token in local storage and cookies
    ↓
Frontend: Show success message "Login successful"
    ↓
Frontend: Redirect to dashboard
```

---

## 13. Testing Validation Rules

### Unit Tests for Validation

```typescript
// Frontend validation tests
describe('Phone Number Validation', () => {
  it('should reject phone number with less than 10 digits', () => {
    const result = validatePhoneNumber('123456789');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Phone number must be 10 digits');
  });

  it('should reject phone number with non-numeric characters', () => {
    const result = validatePhoneNumber('123456789a');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Phone number must contain only digits');
  });

  it('should accept valid 10-digit phone number', () => {
    const result = validatePhoneNumber('9876543210');
    expect(result.valid).toBe(true);
  });

  it('should trim whitespace and accept valid phone number', () => {
    const result = validatePhoneNumber('  9876543210  ');
    expect(result.valid).toBe(true);
  });

  it('should remove internal spaces and accept valid phone number', () => {
    const result = validatePhoneNumber('9876 543 210');
    expect(result.valid).toBe(true);
  });
});

describe('OTP Validation', () => {
  it('should reject OTP with less than 4 digits', () => {
    const result = validateOTP('123');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('OTP must be 4 digits');
  });

  it('should reject OTP with non-numeric characters', () => {
    const result = validateOTP('12a4');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('OTP must contain only digits');
  });

  it('should accept valid 4-digit OTP', () => {
    const result = validateOTP('2213');
    expect(result.valid).toBe(true);
  });
});
```

### Integration Tests for Backend Validation

```typescript
describe('Backend Phone Validation', () => {
  it('should return 400 for invalid phone format', async () => {
    const response = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone_number: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_PHONE_FORMAT');
  });

  it('should return 429 for rate limit exceeded', async () => {
    // Make 3 requests
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/auth/send-otp')
        .send({ phone_number: '9876543210' });
    }

    // 4th request should be rate limited
    const response = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone_number: '9876543210' });

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('TOO_MANY_ATTEMPTS');
  });
});

describe('Backend OTP Validation', () => {
  it('should return 401 for incorrect OTP', async () => {
    // First send OTP
    await request(app)
      .post('/api/auth/send-otp')
      .send({ phone_number: '9876543210' });

    // Then verify with wrong OTP
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone_number: '9876543210', otp: '1234' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_OTP');
  });

  it('should return 410 for expired OTP', async () => {
    // Send OTP
    await request(app)
      .post('/api/auth/send-otp')
      .send({ phone_number: '9876543210' });

    // Wait for OTP to expire (mock time)
    vi.useFakeTimers();
    vi.advanceTimersByTime(11 * 60 * 1000); // 11 minutes

    // Try to verify expired OTP
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone_number: '9876543210', otp: '2213' });

    expect(response.status).toBe(410);
    expect(response.body.error.code).toBe('OTP_EXPIRED');

    vi.useRealTimers();
  });

  it('should return 429 after 5 failed attempts', async () => {
    // Send OTP
    await request(app)
      .post('/api/auth/send-otp')
      .send({ phone_number: '9876543210' });

    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/verify-otp')
        .send({ phone_number: '9876543210', otp: '1234' });
    }

    // 6th attempt should be blocked
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone_number: '9876543210', otp: '2213' });

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('TOO_MANY_ATTEMPTS');
  });
});
```

---

## 14. Security Best Practices

**Best Practice 1: Never Log Sensitive Data**
- Do NOT log phone numbers in plain text
- Do NOT log OTPs in plain text
- Hash sensitive data before logging
- Example: Log `phone_hash: sha256(phone_number)`

**Best Practice 2: Use HTTPS Only**
- All API endpoints must use HTTPS
- Redirect HTTP to HTTPS
- Use HSTS (HTTP Strict-Transport-Security) header

**Best Practice 3: Secure Token Storage**
- Store tokens in secure HTTP-only cookies
- Also store in local storage for client-side access
- Set cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`

**Best Practice 4: Constant-Time Comparison**
- Use constant-time comparison for OTP verification
- Prevents timing attacks
- Example: Use `crypto.timingSafeEqual()` in Node.js

**Best Practice 5: Rate Limiting**
- Implement rate limiting at multiple levels:
  - Per phone number
  - Per IP address
  - Per user account
- Use exponential backoff for retries

**Best Practice 6: Monitoring and Alerting**
- Monitor failed login attempts
- Alert on suspicious patterns (e.g., 100+ attempts in 1 hour)
- Log all security events with timestamp and IP address


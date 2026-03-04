export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidPhoneNumberError extends AuthError {
  constructor(message: string = 'Invalid phone number format') {
    super(message);
    this.name = 'InvalidPhoneNumberError';
  }
}

export class InvalidOTPError extends AuthError {
  constructor(message: string = 'Invalid OTP format') {
    super(message);
    this.name = 'InvalidOTPError';
  }
}

export class OTPExpiredError extends AuthError {
  constructor(message: string = 'OTP has expired') {
    super(message);
    this.name = 'OTPExpiredError';
  }
}

export class OTPLockedError extends AuthError {
  public lockedUntil: number;
  
  constructor(message: string, lockedUntil: number) {
    super(message);
    this.name = 'OTPLockedError';
    this.lockedUntil = lockedUntil;
  }
}

export class RateLimitError extends AuthError {
  public retryAfter: number;
  
  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

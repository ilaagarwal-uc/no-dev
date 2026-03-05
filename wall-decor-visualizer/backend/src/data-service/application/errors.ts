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

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export class InvalidImageFormatError extends ImageUploadError {
  constructor(message: string = 'Invalid image format. Please upload JPEG, PNG, or WebP images.') {
    super(message);
    this.name = 'InvalidImageFormatError';
  }
}

export class InvalidImageSizeError extends ImageUploadError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidImageSizeError';
  }
}

export class GCPUploadError extends ImageUploadError {
  constructor(message: string = 'Failed to upload image to cloud storage') {
    super(message);
    this.name = 'GCPUploadError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class MetadataStorageFailedError extends ImageUploadError {
  constructor(message: string = 'Failed to save image metadata') {
    super(message);
    this.name = 'MetadataStorageFailedError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

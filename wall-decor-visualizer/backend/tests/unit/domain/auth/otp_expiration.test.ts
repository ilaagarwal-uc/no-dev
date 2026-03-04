import { describe, it, expect } from 'vitest';
import { isOTPExpired } from '../../../../src/data-service/domain/auth';
import { IOTP } from '../../../../src/data-service/domain/auth/auth_schema';

describe('OTP Expiration Check', () => {
  it('should return false for OTP created less than 10 minutes ago', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      used: false,
      failedAttempts: 0,
      lockedUntil: null
    };
    expect(isOTPExpired(otp)).toBe(false);
  });

  it('should return true for OTP created exactly 10 minutes ago', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() - 1), // Expired 1ms ago
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      used: false,
      failedAttempts: 0,
      lockedUntil: null
    };
    expect(isOTPExpired(otp)).toBe(true);
  });

  it('should return true for OTP created more than 10 minutes ago', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() - 5 * 60 * 1000), // Expired 5 minutes ago
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      used: false,
      failedAttempts: 0,
      lockedUntil: null
    };
    expect(isOTPExpired(otp)).toBe(true);
  });

  it('should handle edge case of OTP created in future (clock skew)', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() + 11 * 60 * 1000), // 11 minutes from now
      createdAt: new Date(Date.now() + 1 * 60 * 1000), // 1 minute in future
      used: false,
      failedAttempts: 0,
      lockedUntil: null
    };
    expect(isOTPExpired(otp)).toBe(false);
  });
});

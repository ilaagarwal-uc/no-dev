import { describe, it, expect } from 'vitest';
import { isOTPLocked } from '../../../../src/data-service/domain/auth';
import { IOTP } from '../../../../src/data-service/domain/auth/auth_schema';

describe('OTP Lockout Logic', () => {
  it('should return false for OTP with 0 failed attempts', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      used: false,
      failedAttempts: 0,
      lockedUntil: null
    };
    expect(isOTPLocked(otp)).toBe(false);
  });

  it('should return false for OTP with 2 failed attempts', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      used: false,
      failedAttempts: 2,
      lockedUntil: null
    };
    expect(isOTPLocked(otp)).toBe(false);
  });

  it('should return true for OTP with 3 failed attempts and lockedUntil in future', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      used: false,
      failedAttempts: 3,
      lockedUntil: new Date(Date.now() + 30 * 1000) // 30 seconds in future
    };
    expect(isOTPLocked(otp)).toBe(true);
  });

  it('should return false for OTP with 3 failed attempts and lockedUntil in past', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      used: false,
      failedAttempts: 3,
      lockedUntil: new Date(Date.now() - 30 * 1000) // 30 seconds in past
    };
    expect(isOTPLocked(otp)).toBe(false);
  });

  it('should return false for OTP with 5 failed attempts but no lockedUntil', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      used: false,
      failedAttempts: 5,
      lockedUntil: null
    };
    expect(isOTPLocked(otp)).toBe(false);
  });

  it('should return false for OTP with more than 5 failed attempts but no lockedUntil', () => {
    const otp: IOTP = {
      otp: '2213',
      phoneNumber: '1234567890',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      used: false,
      failedAttempts: 10,
      lockedUntil: null
    };
    expect(isOTPLocked(otp)).toBe(false);
  });
});

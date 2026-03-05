import { describe, it, expect } from 'vitest';
import { validateOTP } from '../../../../src/data-service/domain/auth';

describe('OTP Validation (Frontend)', () => {
  it('should return true for valid 4-digit OTP', () => {
    expect(validateOTP('2213')).toBe(true);
  });

  it('should return false for OTP with less than 4 digits', () => {
    expect(validateOTP('221')).toBe(false);
  });

  it('should return false for OTP with more than 4 digits', () => {
    expect(validateOTP('22134')).toBe(false);
  });

  it('should return false for OTP with non-numeric characters', () => {
    expect(validateOTP('221a')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateOTP('')).toBe(false);
  });
});

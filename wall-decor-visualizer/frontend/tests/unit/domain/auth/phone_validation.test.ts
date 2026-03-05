import { describe, it, expect } from 'vitest';
import { validatePhoneNumber } from '../../../../src/data-service/domain/auth';

describe('Phone Number Validation (Frontend)', () => {
  it('should return true for valid 10-digit phone number', () => {
    expect(validatePhoneNumber('1234567890')).toBe(true);
  });

  it('should return false for phone number with less than 10 digits', () => {
    expect(validatePhoneNumber('123456789')).toBe(false);
  });

  it('should return false for phone number with more than 10 digits', () => {
    expect(validatePhoneNumber('12345678901')).toBe(false);
  });

  it('should return false for phone number with non-numeric characters', () => {
    expect(validatePhoneNumber('123-456-7890')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validatePhoneNumber('')).toBe(false);
  });
});

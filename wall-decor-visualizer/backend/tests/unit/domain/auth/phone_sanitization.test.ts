import { describe, it, expect } from 'vitest';
import { sanitizePhoneNumber } from '../../../../src/data-service/domain/auth';

describe('Phone Number Sanitization', () => {
  it('should remove dashes from phone number', () => {
    expect(sanitizePhoneNumber('123-456-7890')).toBe('1234567890');
  });

  it('should remove spaces from phone number', () => {
    expect(sanitizePhoneNumber('123 456 7890')).toBe('1234567890');
  });

  it('should remove parentheses from phone number', () => {
    expect(sanitizePhoneNumber('(123) 456-7890')).toBe('1234567890');
  });

  it('should remove all non-numeric characters', () => {
    expect(sanitizePhoneNumber('+1 (123) 456-7890')).toBe('1123456789');
  });

  it('should return unchanged for already clean phone number', () => {
    expect(sanitizePhoneNumber('1234567890')).toBe('1234567890');
  });

  it('should limit to 10 digits', () => {
    expect(sanitizePhoneNumber('12345678901234')).toBe('1234567890');
  });
});

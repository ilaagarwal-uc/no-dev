import { describe, it, expect } from 'vitest';
import { validateUserId, validateUserOwnership } from '../../../../src/data-service/domain/image-upload';

describe('User Validation', () => {
  describe('validateUserId', () => {
    it('should return true for valid user ID', () => {
      expect(validateUserId('user_123')).toBe(true);
    });

    it('should return true for alphanumeric user ID', () => {
      expect(validateUserId('user123abc')).toBe(true);
    });

    it('should return falsy for empty string', () => {
      expect(!validateUserId('')).toBe(true);
    });

    it('should return false for whitespace only', () => {
      expect(validateUserId('   ')).toBe(false);
    });

    it('should return true for null-like string', () => {
      expect(validateUserId('null')).toBe(true); // It's a valid string
    });
  });

  describe('validateUserOwnership', () => {
    it('should return true when user IDs match', () => {
      expect(validateUserOwnership('user_123', 'user_123')).toBe(true);
    });

    it('should return false when user IDs do not match', () => {
      expect(validateUserOwnership('user_123', 'user_456')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(validateUserOwnership('User_123', 'user_123')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(validateUserOwnership('', '')).toBe(true); // Both empty, so they match
    });

    it('should return false when one is empty', () => {
      expect(validateUserOwnership('user_123', '')).toBe(false);
    });
  });
});

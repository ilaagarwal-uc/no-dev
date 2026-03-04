import { describe, it, expect } from 'vitest';
import { hashPhoneNumber, constantTimeCompare } from '../../../../src/data-service/domain/auth';

describe('Security Functions', () => {
  describe('hashPhoneNumber', () => {
    it('should hash phone number consistently', () => {
      const phone = '1234567890';
      const hash1 = hashPhoneNumber(phone);
      const hash2 = hashPhoneNumber(phone);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different phone numbers', () => {
      const phone1 = '1234567890';
      const phone2 = '0987654321';
      
      const hash1 = hashPhoneNumber(phone1);
      const hash2 = hashPhoneNumber(phone2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should produce hex string of length 64 (SHA-256)', () => {
      const phone = '1234567890';
      const hash = hashPhoneNumber(phone);
      
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('constantTimeCompare', () => {
    it('should return true for identical strings', () => {
      expect(constantTimeCompare('2213', '2213')).toBe(true);
    });

    it('should return false for different strings of same length', () => {
      expect(constantTimeCompare('2213', '1111')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(constantTimeCompare('2213', '221')).toBe(false);
    });

    it('should return false for empty vs non-empty string', () => {
      expect(constantTimeCompare('', '2213')).toBe(false);
    });

    it('should return true for two empty strings', () => {
      expect(constantTimeCompare('', '')).toBe(true);
    });

    it('should handle special characters', () => {
      expect(constantTimeCompare('abc!@#', 'abc!@#')).toBe(true);
      expect(constantTimeCompare('abc!@#', 'abc!@$')).toBe(false);
    });
  });
});

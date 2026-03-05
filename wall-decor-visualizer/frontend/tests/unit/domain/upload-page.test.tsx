import { describe, it, expect } from 'vitest';
import {
  validateImageFormat,
  validateImageSize,
  validateImageNotEmpty,
  formatFileSize,
  maskPhoneNumber,
  getErrorMessage
} from '../../../src/page-service/domain/upload-page/index';

describe('Upload Page Domain Logic', () => {
  describe('validateImageFormat', () => {
    it('should accept JPEG format', () => {
      expect(validateImageFormat('image/jpeg')).toBe(true);
    });

    it('should accept PNG format', () => {
      expect(validateImageFormat('image/png')).toBe(true);
    });

    it('should accept WebP format', () => {
      expect(validateImageFormat('image/webp')).toBe(true);
    });

    it('should reject unsupported formats', () => {
      expect(validateImageFormat('image/gif')).toBe(false);
      expect(validateImageFormat('image/bmp')).toBe(false);
      expect(validateImageFormat('text/plain')).toBe(false);
    });
  });

  describe('validateImageSize', () => {
    it('should accept files between 1KB and 10MB', () => {
      expect(validateImageSize(1024)).toBe(true); // 1KB
      expect(validateImageSize(5242880)).toBe(true); // 5MB
      expect(validateImageSize(10485760)).toBe(true); // 10MB
    });

    it('should reject files smaller than 1KB', () => {
      expect(validateImageSize(512)).toBe(false);
      expect(validateImageSize(0)).toBe(false);
    });

    it('should reject files larger than 10MB', () => {
      expect(validateImageSize(10485761)).toBe(false);
      expect(validateImageSize(20971520)).toBe(false);
    });
  });

  describe('validateImageNotEmpty', () => {
    it('should accept non-empty files', () => {
      expect(validateImageNotEmpty(1024)).toBe(true);
      expect(validateImageNotEmpty(1)).toBe(true);
    });

    it('should reject empty files', () => {
      expect(validateImageNotEmpty(0)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(512)).toBe('0.5 KB');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('maskPhoneNumber', () => {
    it('should mask phone number correctly', () => {
      expect(maskPhoneNumber('+1234567890')).toBe('+1 (***) ***-7890');
      expect(maskPhoneNumber('+19876543210')).toBe('+1 (***) ***-3210');
    });

    it('should extract last 4 digits', () => {
      const masked = maskPhoneNumber('+1111111111');
      expect(masked).toContain('1111');
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error messages', () => {
      expect(getErrorMessage('INVALID_IMAGE_FORMAT')).toContain('JPG, PNG, or WebP');
      expect(getErrorMessage('IMAGE_SIZE_EXCEEDS_LIMIT')).toContain('10MB');
      expect(getErrorMessage('EMPTY_FILE')).toContain('empty');
      expect(getErrorMessage('UNAUTHORIZED')).toContain('log in');
    });

    it('should return default message for unknown codes', () => {
      expect(getErrorMessage('UNKNOWN_ERROR')).toBe('An error occurred. Please try again.');
    });
  });
});

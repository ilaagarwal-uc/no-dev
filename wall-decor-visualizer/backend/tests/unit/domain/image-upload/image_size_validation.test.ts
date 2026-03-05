import { describe, it, expect } from 'vitest';
import { validateImageSize, validateImageNotEmpty } from '../../../../src/data-service/domain/image-upload';

describe('Image Size Validation', () => {
  describe('validateImageSize', () => {
    it('should return true for minimum size (1KB)', () => {
      expect(validateImageSize(1024)).toBe(true);
    });

    it('should return true for maximum size (10MB)', () => {
      expect(validateImageSize(10 * 1024 * 1024)).toBe(true);
    });

    it('should return true for size between min and max', () => {
      expect(validateImageSize(5 * 1024 * 1024)).toBe(true);
    });

    it('should return false for size below minimum (1KB)', () => {
      expect(validateImageSize(1023)).toBe(false);
    });

    it('should return false for size exceeding maximum (10MB)', () => {
      expect(validateImageSize(10 * 1024 * 1024 + 1)).toBe(false);
    });

    it('should return false for zero bytes', () => {
      expect(validateImageSize(0)).toBe(false);
    });

    it('should return false for negative size', () => {
      expect(validateImageSize(-1024)).toBe(false);
    });
  });

  describe('validateImageNotEmpty', () => {
    it('should return true for non-zero file size', () => {
      expect(validateImageNotEmpty(1024)).toBe(true);
    });

    it('should return false for zero bytes', () => {
      expect(validateImageNotEmpty(0)).toBe(false);
    });

    it('should return false for negative size', () => {
      expect(validateImageNotEmpty(-1)).toBe(false);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { validateImageConstraints } from '../../../../src/data-service/domain/image-upload';
import { Buffer } from 'buffer';

describe('Image Constraints Validation', () => {
  describe('Empty file validation', () => {
    it('should return EMPTY_FILE error for zero-byte file', () => {
      const emptyBuffer = Buffer.from([]);
      const result = validateImageConstraints('image/jpeg', 0, emptyBuffer);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('EMPTY_FILE');
    });
  });

  describe('MIME type validation', () => {
    it('should return INVALID_IMAGE_FORMAT for unsupported MIME type', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const result = validateImageConstraints('image/gif', 1024, buffer);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_IMAGE_FORMAT');
    });
  });

  describe('Minimum size validation', () => {
    it('should return IMAGE_SIZE_BELOW_MINIMUM for file smaller than 1KB', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const result = validateImageConstraints('image/jpeg', 512, jpegBuffer);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('IMAGE_SIZE_BELOW_MINIMUM');
    });
  });

  describe('Maximum size validation', () => {
    it('should return IMAGE_SIZE_EXCEEDS_LIMIT for file larger than 10MB', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const result = validateImageConstraints('image/jpeg', 11 * 1024 * 1024, jpegBuffer);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('IMAGE_SIZE_EXCEEDS_LIMIT');
    });
  });

  describe('Magic number validation', () => {
    it('should return INVALID_IMAGE_FORMAT for mismatched magic number', () => {
      // PNG magic number but claiming JPEG
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const result = validateImageConstraints('image/jpeg', 2048, pngBuffer);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_IMAGE_FORMAT');
    });
  });

  describe('Valid image validation', () => {
    it('should return valid for correct JPEG', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const result = validateImageConstraints('image/jpeg', 2048, jpegBuffer);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for correct PNG', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const result = validateImageConstraints('image/png', 2048, pngBuffer);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for correct WebP', () => {
      const webpBuffer = Buffer.alloc(12);
      webpBuffer[0] = 0x52;
      webpBuffer[1] = 0x49;
      webpBuffer[2] = 0x46;
      webpBuffer[3] = 0x46;
      webpBuffer[8] = 0x57;
      webpBuffer[9] = 0x45;
      webpBuffer[10] = 0x42;
      webpBuffer[11] = 0x50;
      const result = validateImageConstraints('image/webp', 2048, webpBuffer);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for maximum size file', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const result = validateImageConstraints('image/jpeg', 10 * 1024 * 1024, jpegBuffer);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for minimum size file', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const result = validateImageConstraints('image/jpeg', 1024, jpegBuffer);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

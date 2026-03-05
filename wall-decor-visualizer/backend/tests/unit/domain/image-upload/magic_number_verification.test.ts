import { describe, it, expect } from 'vitest';
import { verifyMagicNumber } from '../../../../src/data-service/domain/image-upload';
import { Buffer } from 'buffer';

describe('Magic Number Verification', () => {
  describe('JPEG verification', () => {
    it('should return true for valid JPEG magic number', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      expect(verifyMagicNumber('image/jpeg', jpegBuffer)).toBe(true);
    });

    it('should return false for invalid JPEG magic number', () => {
      const invalidBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      expect(verifyMagicNumber('image/jpeg', invalidBuffer)).toBe(false);
    });

    it('should return false for empty buffer', () => {
      const emptyBuffer = Buffer.from([]);
      expect(verifyMagicNumber('image/jpeg', emptyBuffer)).toBe(false);
    });
  });

  describe('PNG verification', () => {
    it('should return true for valid PNG magic number', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      expect(verifyMagicNumber('image/png', pngBuffer)).toBe(true);
    });

    it('should return false for invalid PNG magic number', () => {
      const invalidBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      expect(verifyMagicNumber('image/png', invalidBuffer)).toBe(false);
    });
  });

  describe('WebP verification', () => {
    it('should return true for valid WebP magic number', () => {
      // RIFF header + WebP signature
      const webpBuffer = Buffer.alloc(12);
      webpBuffer[0] = 0x52; // R
      webpBuffer[1] = 0x49; // I
      webpBuffer[2] = 0x46; // F
      webpBuffer[3] = 0x46; // F
      webpBuffer[8] = 0x57; // W
      webpBuffer[9] = 0x45; // E
      webpBuffer[10] = 0x42; // B
      webpBuffer[11] = 0x50; // P
      expect(verifyMagicNumber('image/webp', webpBuffer)).toBe(true);
    });

    it('should return false for invalid WebP magic number (missing RIFF)', () => {
      const invalidBuffer = Buffer.alloc(12);
      invalidBuffer[8] = 0x57;
      invalidBuffer[9] = 0x45;
      invalidBuffer[10] = 0x42;
      invalidBuffer[11] = 0x50;
      expect(verifyMagicNumber('image/webp', invalidBuffer)).toBe(false);
    });

    it('should return false for WebP buffer too short', () => {
      const shortBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46]);
      expect(verifyMagicNumber('image/webp', shortBuffer)).toBe(false);
    });
  });

  describe('Unsupported format', () => {
    it('should return false for unsupported MIME type', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      expect(verifyMagicNumber('image/gif', buffer)).toBe(false);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { validateImageFormat } from '../../../../src/data-service/domain/image-upload';

describe('Image Format Validation', () => {
  it('should return true for JPEG MIME type', () => {
    expect(validateImageFormat('image/jpeg')).toBe(true);
  });

  it('should return true for PNG MIME type', () => {
    expect(validateImageFormat('image/png')).toBe(true);
  });

  it('should return true for WebP MIME type', () => {
    expect(validateImageFormat('image/webp')).toBe(true);
  });

  it('should return false for unsupported MIME type (GIF)', () => {
    expect(validateImageFormat('image/gif')).toBe(false);
  });

  it('should return false for unsupported MIME type (BMP)', () => {
    expect(validateImageFormat('image/bmp')).toBe(false);
  });

  it('should return false for unsupported MIME type (TIFF)', () => {
    expect(validateImageFormat('image/tiff')).toBe(false);
  });

  it('should return false for non-image MIME type', () => {
    expect(validateImageFormat('text/plain')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateImageFormat('')).toBe(false);
  });

  it('should return false for null-like string', () => {
    expect(validateImageFormat('null')).toBe(false);
  });
});

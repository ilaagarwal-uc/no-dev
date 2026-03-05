import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../../../../src/data-service/domain/image-upload';

describe('Filename Sanitization', () => {
  it('should preserve valid filename', () => {
    expect(sanitizeFilename('photo.jpg')).toBe('photo.jpg');
  });

  it('should convert to lowercase', () => {
    expect(sanitizeFilename('PHOTO.JPG')).toBe('photo.jpg');
  });

  it('should remove path traversal attempts (../ style)', () => {
    expect(sanitizeFilename('../../../etc/passwd.jpg')).toBe('etc_passwd.jpg');
  });

  it('should remove path traversal attempts (..\\ style)', () => {
    expect(sanitizeFilename('..\\..\\windows\\system32.jpg')).toBe('windows_system32.jpg');
  });

  it('should replace special characters with underscore', () => {
    expect(sanitizeFilename('photo@#$%.jpg')).toBe('photo____.jpg');
  });

  it('should preserve hyphens and underscores', () => {
    expect(sanitizeFilename('my-photo_2024.jpg')).toBe('my-photo_2024.jpg');
  });

  it('should preserve dots in extension', () => {
    expect(sanitizeFilename('photo.backup.jpg')).toBe('photo.backup.jpg');
  });

  it('should handle filename without extension', () => {
    expect(sanitizeFilename('photo')).toBe('photo');
  });

  it('should handle filename with spaces', () => {
    expect(sanitizeFilename('my photo.jpg')).toBe('my_photo.jpg');
  });

  it('should limit filename length to 255 characters', () => {
    const longName = 'a'.repeat(300) + '.jpg';
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(255);
    expect(result.endsWith('.jpg')).toBe(true);
  });

  it('should handle empty string', () => {
    expect(sanitizeFilename('')).toBe('image');
  });

  it('should handle filename with unicode characters', () => {
    const result = sanitizeFilename('фото.jpg');
    expect(result).toBe('____.jpg');
  });

  it('should handle filename with multiple dots', () => {
    expect(sanitizeFilename('photo.backup.2024.jpg')).toBe('photo.backup.2024.jpg');
  });

  it('should handle filename with leading/trailing dots', () => {
    expect(sanitizeFilename('.photo.jpg')).toBe('.photo.jpg');
  });
});

import { describe, it, expect } from 'vitest';
import { shouldPermanentlyInvalidate } from '../../../../src/data-service/domain/auth';

describe('Permanent Invalidation Check', () => {
  it('should return false for less than 5 failed attempts', () => {
    expect(shouldPermanentlyInvalidate(4)).toBe(false);
  });

  it('should return true for exactly 5 failed attempts', () => {
    expect(shouldPermanentlyInvalidate(5)).toBe(true);
  });

  it('should return true for more than 5 failed attempts', () => {
    expect(shouldPermanentlyInvalidate(6)).toBe(true);
  });

  it('should return false for 0 failed attempts', () => {
    expect(shouldPermanentlyInvalidate(0)).toBe(false);
  });

  it('should return false for 3 failed attempts', () => {
    expect(shouldPermanentlyInvalidate(3)).toBe(false);
  });
});

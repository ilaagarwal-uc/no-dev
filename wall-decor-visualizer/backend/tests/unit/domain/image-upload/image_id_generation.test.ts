import { describe, it, expect } from 'vitest';
import { generateImageId } from '../../../../src/data-service/domain/image-upload';

describe('Image ID Generation', () => {
  it('should generate a valid image ID', () => {
    const id = generateImageId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('should start with img_ prefix', () => {
    const id = generateImageId();
    expect(id.startsWith('img_')).toBe(true);
  });

  it('should generate unique IDs', () => {
    const id1 = generateImageId();
    const id2 = generateImageId();
    expect(id1).not.toBe(id2);
  });

  it('should generate IDs of reasonable length', () => {
    const id = generateImageId();
    expect(id.length).toBeGreaterThan(4); // At least 'img_' + some chars
    expect(id.length).toBeLessThan(50); // Reasonable upper bound
  });

  it('should generate multiple unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateImageId());
    }
    expect(ids.size).toBe(100); // All should be unique
  });

  it('should contain only valid characters', () => {
    const id = generateImageId();
    expect(/^img_[a-z0-9]+$/.test(id)).toBe(true);
  });
});

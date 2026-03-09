import { describe, it, expect, vi } from 'vitest';
import {
  duplicateModel,
  resetModelTransform,
  toggleLockPosition,
  canTransformModel,
  applyTransform,
  createOriginalTransform,
  getOriginalTransform,
} from '../../../../src/page-service/domain/create-look-page/context_menu_actions';
import { IAppliedModel } from '../../../../src/page-service/domain/create-look-page/interface';

describe('Context Menu Actions', () => {
  const mockModel: IAppliedModel = {
    id: 'model-123',
    catalogItemId: 'catalog-456',
    position: { x: 1.0, y: 2.0, z: 3.0 },
    rotation: { x: 45, y: 90, z: 0 },
    scale: { x: 1.5, y: 1.5, z: 1.5 },
    quantity: 5,
    manualQuantity: false,
    placementMethod: 'pen',
    isLocked: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('duplicateModel', () => {
    it('should create a copy with new ID', () => {
      const generateId = vi.fn(() => 'new-id-789');
      const duplicated = duplicateModel(mockModel, generateId);

      expect(duplicated.id).toBe('new-id-789');
      expect(generateId).toHaveBeenCalledTimes(1);
    });

    it('should offset position slightly for visibility', () => {
      const generateId = () => 'new-id';
      const duplicated = duplicateModel(mockModel, generateId);

      expect(duplicated.position.x).toBe(mockModel.position.x + 0.1);
      expect(duplicated.position.y).toBe(mockModel.position.y);
      expect(duplicated.position.z).toBe(mockModel.position.z + 0.1);
    });

    it('should copy all other properties', () => {
      const generateId = () => 'new-id';
      const duplicated = duplicateModel(mockModel, generateId);

      expect(duplicated.catalogItemId).toBe(mockModel.catalogItemId);
      expect(duplicated.rotation).toEqual(mockModel.rotation);
      expect(duplicated.scale).toEqual(mockModel.scale);
      expect(duplicated.quantity).toBe(mockModel.quantity);
      expect(duplicated.manualQuantity).toBe(mockModel.manualQuantity);
      expect(duplicated.placementMethod).toBe(mockModel.placementMethod);
    });

    it('should update createdAt and updatedAt timestamps', () => {
      const generateId = () => 'new-id';
      const beforeTime = Date.now();
      const duplicated = duplicateModel(mockModel, generateId);
      const afterTime = Date.now();

      expect(duplicated.createdAt).not.toBe(mockModel.createdAt);
      expect(duplicated.updatedAt).not.toBe(mockModel.updatedAt);
      expect(new Date(duplicated.createdAt).getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(new Date(duplicated.createdAt).getTime()).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('resetModelTransform', () => {
    it('should reset rotation to (0, 0, 0)', () => {
      const reset = resetModelTransform(mockModel);

      expect(reset.rotation).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should reset scale to (1, 1, 1)', () => {
      const reset = resetModelTransform(mockModel);

      expect(reset.scale).toEqual({ x: 1, y: 1, z: 1 });
    });

    it('should preserve position when no original position provided', () => {
      const reset = resetModelTransform(mockModel);

      expect(reset.position).toEqual(mockModel.position);
    });

    it('should use original position when provided', () => {
      const originalPosition = { x: 5.0, y: 6.0, z: 7.0 };
      const reset = resetModelTransform(mockModel, originalPosition);

      expect(reset.position).toEqual(originalPosition);
    });

    it('should update updatedAt timestamp', () => {
      const beforeTime = Date.now();
      const reset = resetModelTransform(mockModel);
      const afterTime = Date.now();

      expect(reset.updatedAt).not.toBe(mockModel.updatedAt);
      expect(new Date(reset.updatedAt).getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(new Date(reset.updatedAt).getTime()).toBeLessThanOrEqual(afterTime);
    });

    it('should preserve other properties', () => {
      const reset = resetModelTransform(mockModel);

      expect(reset.id).toBe(mockModel.id);
      expect(reset.catalogItemId).toBe(mockModel.catalogItemId);
      expect(reset.quantity).toBe(mockModel.quantity);
      expect(reset.manualQuantity).toBe(mockModel.manualQuantity);
    });
  });

  describe('toggleLockPosition', () => {
    it('should lock an unlocked model', () => {
      const model = { ...mockModel, isLocked: false };
      const toggled = toggleLockPosition(model);

      expect(toggled.isLocked).toBe(true);
    });

    it('should unlock a locked model', () => {
      const model = { ...mockModel, isLocked: true };
      const toggled = toggleLockPosition(model);

      expect(toggled.isLocked).toBe(false);
    });

    it('should handle undefined isLocked (treat as false)', () => {
      const model = { ...mockModel, isLocked: undefined };
      const toggled = toggleLockPosition(model);

      expect(toggled.isLocked).toBe(true);
    });

    it('should update updatedAt timestamp', () => {
      const beforeTime = Date.now();
      const toggled = toggleLockPosition(mockModel);
      const afterTime = Date.now();

      expect(toggled.updatedAt).not.toBe(mockModel.updatedAt);
      expect(new Date(toggled.updatedAt).getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(new Date(toggled.updatedAt).getTime()).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('canTransformModel', () => {
    it('should return true for unlocked model', () => {
      const model = { ...mockModel, isLocked: false };
      expect(canTransformModel(model)).toBe(true);
    });

    it('should return false for locked model', () => {
      const model = { ...mockModel, isLocked: true };
      expect(canTransformModel(model)).toBe(false);
    });

    it('should return true when isLocked is undefined', () => {
      const model = { ...mockModel, isLocked: undefined };
      expect(canTransformModel(model)).toBe(true);
    });
  });

  describe('applyTransform', () => {
    it('should apply position transform to unlocked model', () => {
      const model = { ...mockModel, isLocked: false };
      const newPosition = { x: 10, y: 20, z: 30 };
      const transformed = applyTransform(model, { position: newPosition });

      expect(transformed.position).toEqual(newPosition);
    });

    it('should not apply position transform to locked model', () => {
      const model = { ...mockModel, isLocked: true };
      const newPosition = { x: 10, y: 20, z: 30 };
      const transformed = applyTransform(model, { position: newPosition });

      expect(transformed.position).toEqual(model.position);
      expect(transformed).toBe(model); // Should return original model
    });

    it('should apply rotation transform regardless of lock', () => {
      const model = { ...mockModel, isLocked: true };
      const newRotation = { x: 180, y: 90, z: 45 };
      const transformed = applyTransform(model, { rotation: newRotation });

      expect(transformed.rotation).toEqual(newRotation);
    });

    it('should apply scale transform regardless of lock', () => {
      const model = { ...mockModel, isLocked: true };
      const newScale = { x: 2.0, y: 2.0, z: 2.0 };
      const transformed = applyTransform(model, { scale: newScale });

      expect(transformed.scale).toEqual(newScale);
    });

    it('should apply multiple transforms at once', () => {
      const model = { ...mockModel, isLocked: false };
      const transform = {
        position: { x: 10, y: 20, z: 30 },
        rotation: { x: 180, y: 90, z: 45 },
        scale: { x: 2.0, y: 2.0, z: 2.0 },
      };
      const transformed = applyTransform(model, transform);

      expect(transformed.position).toEqual(transform.position);
      expect(transformed.rotation).toEqual(transform.rotation);
      expect(transformed.scale).toEqual(transform.scale);
    });

    it('should update updatedAt timestamp', () => {
      const model = { ...mockModel, isLocked: false };
      const beforeTime = Date.now();
      const transformed = applyTransform(model, { position: { x: 10, y: 20, z: 30 } });
      const afterTime = Date.now();

      expect(transformed.updatedAt).not.toBe(model.updatedAt);
      expect(new Date(transformed.updatedAt).getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(new Date(transformed.updatedAt).getTime()).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('createOriginalTransform', () => {
    it('should create original transform record', () => {
      const original = createOriginalTransform(mockModel);

      expect(original.modelId).toBe(mockModel.id);
      expect(original.position).toEqual(mockModel.position);
      expect(original.rotation).toEqual(mockModel.rotation);
      expect(original.scale).toEqual(mockModel.scale);
    });

    it('should create deep copies of transform values', () => {
      const original = createOriginalTransform(mockModel);

      // Modify original model
      mockModel.position.x = 999;
      mockModel.rotation.y = 999;
      mockModel.scale.z = 999;

      // Original transform should not be affected
      expect(original.position.x).not.toBe(999);
      expect(original.rotation.y).not.toBe(999);
      expect(original.scale.z).not.toBe(999);
    });
  });

  describe('getOriginalTransform', () => {
    it('should retrieve original transform from map', () => {
      const originalTransform = createOriginalTransform(mockModel);
      const map = new Map();
      map.set(mockModel.id, originalTransform);

      const retrieved = getOriginalTransform(mockModel.id, map);

      expect(retrieved).toEqual(originalTransform);
    });

    it('should return null when model not found', () => {
      const map = new Map();

      const retrieved = getOriginalTransform('non-existent-id', map);

      expect(retrieved).toBeNull();
    });

    it('should return null for empty map', () => {
      const map = new Map();

      const retrieved = getOriginalTransform(mockModel.id, map);

      expect(retrieved).toBeNull();
    });
  });
});

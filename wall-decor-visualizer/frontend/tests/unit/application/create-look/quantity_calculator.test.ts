/**
 * Unit tests for Quantity Calculator
 */

import { describe, it, expect } from 'vitest';
import {
  calculateQuantity,
  recalculateQuantityOnScaleChange,
  setManualQuantity,
  clearManualQuantity,
} from '../../../../src/data-service/application/create-look/quantity_calculator';
import {
  IAppliedModel,
  ICatalogItem,
  IMarkedDimensions,
} from '../../../../src/data-service/domain/create-look/create_look_schema';

// Helper function to create test applied model
function createTestAppliedModel(overrides?: Partial<IAppliedModel>): IAppliedModel {
  return {
    id: 'test-model-1',
    catalogItemId: 'test-item-1',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1.0, y: 1.0, z: 1.0 },
    quantity: 0,
    manualQuantity: false,
    placementMethod: 'mouse',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Helper function to create test catalog item
function createTestCatalogItem(overrides?: Partial<ICatalogItem>): ICatalogItem {
  return {
    id: 'test-item-1',
    name: 'Test Panel',
    description: 'Test panel description',
    category: 'panels',
    dimensions: { width: 4, height: 8, depth: 0.5 },
    thumbnailUrl: 'https://example.com/thumb.png',
    modelUrl: 'https://example.com/model.glb',
    filePath: '/models/test.glb',
    tags: ['test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Helper function to create test marked dimensions
function createTestMarkedDimensions(overrides?: Partial<IMarkedDimensions>): IMarkedDimensions {
  return {
    width: 10,
    height: 8,
    area: 80,
    ...overrides,
  };
}

describe('calculateQuantity', () => {
  describe('Panel-type calculation', () => {
    it('should calculate quantity for panels based on area', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'panels',
        dimensions: { width: 4, height: 8, depth: 0.5 }, // 32 sq ft per panel
      });
      const markedDimensions = createTestMarkedDimensions({
        area: 100, // 100 sq ft wall
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      // 100 / 32 = 3.125, ceil = 4 panels
      expect(result.quantity).toBe(4);
      expect(result.unit).toBe('pieces');
      expect(result.calculationMethod).toBe('panel');
      expect(result.coverageArea).toBe(128); // 4 * 32
    });

    it('should apply scale to panel dimensions', () => {
      const appliedModel = createTestAppliedModel({
        scale: { x: 2.0, y: 2.0, z: 1.0 }, // Double size
      });
      const catalogItem = createTestCatalogItem({
        category: 'panels',
        dimensions: { width: 4, height: 8, depth: 0.5 }, // 32 sq ft at 1x scale
      });
      const markedDimensions = createTestMarkedDimensions({
        area: 100,
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      // Scaled panel: 8 x 16 = 128 sq ft per panel
      // 100 / 128 = 0.78, ceil = 1 panel
      expect(result.quantity).toBe(1);
    });

    it('should return at least 1 panel', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'panels',
        dimensions: { width: 100, height: 100, depth: 1 }, // Very large panel
      });
      const markedDimensions = createTestMarkedDimensions({
        area: 10, // Small wall
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      expect(result.quantity).toBe(1);
    });

    it('should round up to nearest whole number', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'panels',
        dimensions: { width: 3, height: 3, depth: 0.5 }, // 9 sq ft per panel
      });
      const markedDimensions = createTestMarkedDimensions({
        area: 50, // 50 sq ft wall
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      // 50 / 9 = 5.56, ceil = 6 panels
      expect(result.quantity).toBe(6);
    });
  });

  describe('Linear-type calculation', () => {
    it('should calculate quantity for bidding based on perimeter', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'bidding',
        dimensions: { width: 8, height: 1, depth: 0.5 }, // 8 ft per piece
      });
      const markedDimensions = createTestMarkedDimensions({
        width: 10,
        height: 8,
        area: 80,
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      // Perimeter: 2 * (10 + 8) = 36 ft
      // 36 / 8 = 4.5, ceil = 5 pieces
      expect(result.quantity).toBe(5);
      expect(result.unit).toBe('linear_feet');
      expect(result.calculationMethod).toBe('linear');
    });

    it('should calculate quantity for cove based on perimeter', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'cove',
        dimensions: { width: 6, height: 1, depth: 0.5 }, // 6 ft per piece
      });
      const markedDimensions = createTestMarkedDimensions({
        width: 12,
        height: 10,
        area: 120,
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      // Perimeter: 2 * (12 + 10) = 44 ft
      // 44 / 6 = 7.33, ceil = 8 pieces
      expect(result.quantity).toBe(8);
      expect(result.unit).toBe('linear_feet');
      expect(result.calculationMethod).toBe('linear');
    });

    it('should apply scale to linear item length', () => {
      const appliedModel = createTestAppliedModel({
        scale: { x: 0.5, y: 1.0, z: 1.0 }, // Half length
      });
      const catalogItem = createTestCatalogItem({
        category: 'bidding',
        dimensions: { width: 8, height: 1, depth: 0.5 }, // 8 ft at 1x scale
      });
      const markedDimensions = createTestMarkedDimensions({
        width: 10,
        height: 8,
        area: 80,
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      // Scaled length: 8 * 0.5 = 4 ft per piece
      // Perimeter: 36 ft
      // 36 / 4 = 9 pieces
      expect(result.quantity).toBe(9);
    });
  });

  describe('Point-type calculation', () => {
    it('should calculate quantity for lights based on spacing', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'lights',
        dimensions: { width: 1, height: 1, depth: 0.5 },
      });
      const markedDimensions = createTestMarkedDimensions({
        area: 100, // 100 sq ft wall
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      // 1 light per 16 sq ft
      // 100 / 16 = 6.25, ceil = 7 lights
      expect(result.quantity).toBe(7);
      expect(result.unit).toBe('pieces');
      expect(result.calculationMethod).toBe('point');
    });

    it('should return at least 1 light for small areas', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'lights',
        dimensions: { width: 1, height: 1, depth: 0.5 },
      });
      const markedDimensions = createTestMarkedDimensions({
        area: 5, // Small wall
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      // 5 / 16 = 0.31, ceil = 1 light
      expect(result.quantity).toBe(1);
    });
  });

  describe('Custom-type calculation', () => {
    it('should default to 1 piece for artwork', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'artwork',
        dimensions: { width: 3, height: 4, depth: 0.1 },
      });
      const markedDimensions = createTestMarkedDimensions({
        area: 80,
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      expect(result.quantity).toBe(1);
      expect(result.unit).toBe('pieces');
      expect(result.calculationMethod).toBe('custom');
      expect(result.notes).toContain('Manual quantity adjustment recommended');
    });

    it('should default to 1 piece for other category', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem({
        category: 'other',
        dimensions: { width: 2, height: 2, depth: 1 },
      });
      const markedDimensions = createTestMarkedDimensions({
        area: 80,
      });

      const result = calculateQuantity(appliedModel, catalogItem, markedDimensions);

      expect(result.quantity).toBe(1);
      expect(result.calculationMethod).toBe('custom');
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid marked dimensions', () => {
      const appliedModel = createTestAppliedModel();
      const catalogItem = createTestCatalogItem();
      const markedDimensions = createTestMarkedDimensions({
        area: 0, // Invalid
      });

      expect(() => {
        calculateQuantity(appliedModel, catalogItem, markedDimensions);
      }).toThrow('Invalid marked dimensions');
    });

    it('should throw error for missing inputs', () => {
      expect(() => {
        calculateQuantity(null as any, null as any, null as any);
      }).toThrow('Invalid input');
    });
  });
});

describe('recalculateQuantityOnScaleChange', () => {
  it('should recalculate quantity when scale changes', () => {
    const appliedModel = createTestAppliedModel({
      scale: { x: 2.0, y: 2.0, z: 1.0 },
      quantity: 5, // Old quantity
      manualQuantity: false,
    });
    const catalogItem = createTestCatalogItem({
      category: 'panels',
      dimensions: { width: 4, height: 8, depth: 0.5 },
    });
    const markedDimensions = createTestMarkedDimensions({
      area: 100,
    });

    const result = recalculateQuantityOnScaleChange(
      appliedModel,
      catalogItem,
      markedDimensions
    );

    // Should recalculate with new scale
    expect(result.quantity).toBe(1); // Larger panels need fewer pieces
  });

  it('should preserve manual quantity when set', () => {
    const appliedModel = createTestAppliedModel({
      scale: { x: 2.0, y: 2.0, z: 1.0 },
      quantity: 10, // Manual quantity
      manualQuantity: true,
    });
    const catalogItem = createTestCatalogItem({
      category: 'panels',
      dimensions: { width: 4, height: 8, depth: 0.5 },
    });
    const markedDimensions = createTestMarkedDimensions({
      area: 100,
    });

    const result = recalculateQuantityOnScaleChange(
      appliedModel,
      catalogItem,
      markedDimensions
    );

    // Should preserve manual quantity
    expect(result.quantity).toBe(10);
    expect(result.notes).toContain('Manual quantity preserved');
  });
});

describe('setManualQuantity', () => {
  it('should set manual quantity and mark as manual', () => {
    const appliedModel = createTestAppliedModel({
      quantity: 5,
      manualQuantity: false,
    });

    const result = setManualQuantity(appliedModel, 15);

    expect(result.quantity).toBe(15);
    expect(result.manualQuantity).toBe(true);
  });

  it('should floor decimal values', () => {
    const appliedModel = createTestAppliedModel();

    const result = setManualQuantity(appliedModel, 7.8);

    expect(result.quantity).toBe(7);
  });

  it('should throw error for quantity less than 1', () => {
    const appliedModel = createTestAppliedModel();

    expect(() => {
      setManualQuantity(appliedModel, 0);
    }).toThrow('Manual quantity must be at least 1');

    expect(() => {
      setManualQuantity(appliedModel, -5);
    }).toThrow('Manual quantity must be at least 1');
  });

  it('should update updatedAt timestamp', () => {
    const appliedModel = createTestAppliedModel({
      updatedAt: '2024-01-01T00:00:00.000Z',
    });

    const result = setManualQuantity(appliedModel, 10);

    expect(result.updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
  });
});

describe('clearManualQuantity', () => {
  it('should recalculate quantity and clear manual flag', () => {
    const appliedModel = createTestAppliedModel({
      quantity: 20, // Manual quantity
      manualQuantity: true,
    });
    const catalogItem = createTestCatalogItem({
      category: 'panels',
      dimensions: { width: 4, height: 8, depth: 0.5 },
    });
    const markedDimensions = createTestMarkedDimensions({
      area: 100,
    });

    const result = clearManualQuantity(appliedModel, catalogItem, markedDimensions);

    // Should recalculate: 100 / 32 = 3.125, ceil = 4
    expect(result.quantity).toBe(4);
    expect(result.manualQuantity).toBe(false);
  });

  it('should update updatedAt timestamp', () => {
    const appliedModel = createTestAppliedModel({
      quantity: 20,
      manualQuantity: true,
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    const catalogItem = createTestCatalogItem();
    const markedDimensions = createTestMarkedDimensions();

    const result = clearManualQuantity(appliedModel, catalogItem, markedDimensions);

    expect(result.updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
  });
});

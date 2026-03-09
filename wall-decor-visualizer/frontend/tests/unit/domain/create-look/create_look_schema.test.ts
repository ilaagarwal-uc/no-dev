import { describe, it, expect } from 'vitest';
import {
  validateCatalogItem,
  validateAppliedModel,
  validateTransform,
  validateBOMItem,
  validateLook,
  type ICatalogItem,
  type IAppliedModel,
  type ITransform,
  type IBOMItem,
  type ILook,
} from '../../../../src/data-service/domain/create-look/create_look_schema';

describe('Create Look Schema Validation', () => {
  describe('validateCatalogItem', () => {
    it('should validate a valid catalog item', () => {
      const validItem: ICatalogItem = {
        id: 'WX919',
        name: 'Test Panel',
        description: 'A test panel',
        category: 'panels',
        dimensions: {
          width: 4,
          height: 8,
          depth: 0.5,
        },
        thumbnailUrl: 'https://example.com/thumb.png',
        modelUrl: 'https://example.com/model.glb',
        filePath: '/models/WX919_4X8X0.5_FT.glb',
        tags: ['panel', 'wall'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = validateCatalogItem(validItem);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validItem);
    });

    it('should reject invalid catalog item with negative dimensions', () => {
      const invalidItem = {
        id: 'WX919',
        name: 'Test Panel',
        description: 'A test panel',
        category: 'panels',
        dimensions: {
          width: -4,
          height: 8,
          depth: 0.5,
        },
        thumbnailUrl: 'https://example.com/thumb.png',
        modelUrl: 'https://example.com/model.glb',
        filePath: '/models/WX919_4X8X0.5_FT.glb',
        tags: ['panel', 'wall'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = validateCatalogItem(invalidItem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Width must be positive');
    });
  });

  describe('validateAppliedModel', () => {
    it('should validate a valid applied model', () => {
      const validModel: IAppliedModel = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        catalogItemId: 'WX919',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        quantity: 10,
        manualQuantity: false,
        placementMethod: 'pen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = validateAppliedModel(validModel);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validModel);
    });

    it('should reject applied model with invalid scale', () => {
      const invalidModel = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        catalogItemId: 'WX919',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 15, y: 1, z: 1 }, // Scale > 10.0
        quantity: 10,
        manualQuantity: false,
        placementMethod: 'pen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = validateAppliedModel(invalidModel);
      expect(result.success).toBe(false);
      expect(result.error).toContain('X scale must be at most 10.0');
    });
  });

  describe('validateTransform', () => {
    it('should validate a transform with position only', () => {
      const validTransform: ITransform = {
        position: { x: 1, y: 2, z: 3 },
      };

      const result = validateTransform(validTransform);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validTransform);
    });

    it('should validate a transform with all properties', () => {
      const validTransform: ITransform = {
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 45, y: 90, z: 180 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      };

      const result = validateTransform(validTransform);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validTransform);
    });

    it('should reject empty transform', () => {
      const invalidTransform = {};

      const result = validateTransform(invalidTransform);
      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one property');
    });
  });

  describe('validateBOMItem', () => {
    it('should validate a valid BOM item', () => {
      const validBOMItem: IBOMItem = {
        catalogItemId: 'WX919',
        name: 'Test Panel',
        category: 'panels',
        quantity: 20,
        unitCost: 50,
        totalCost: 1000,
        dimensions: {
          width: 4,
          height: 8,
          depth: 0.5,
        },
        instances: 2,
        coverageArea: 64,
      };

      const result = validateBOMItem(validBOMItem);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validBOMItem);
    });

    it('should reject BOM item with incorrect total cost', () => {
      const invalidBOMItem = {
        catalogItemId: 'WX919',
        name: 'Test Panel',
        category: 'panels',
        quantity: 20,
        unitCost: 50,
        totalCost: 500, // Should be 1000
        dimensions: {
          width: 4,
          height: 8,
          depth: 0.5,
        },
        instances: 2,
        coverageArea: 64,
      };

      const result = validateBOMItem(invalidBOMItem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Total cost must equal quantity * unitCost');
    });
  });

  describe('validateLook', () => {
    it('should validate a valid look', () => {
      const validLook: ILook = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'My Wall Design',
        description: 'A beautiful wall design',
        baseModelId: 'base-model-123',
        appliedModels: [],
        billOfMaterials: [],
        thumbnailUrl: 'https://example.com/thumbnail.png',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = validateLook(validLook);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validLook);
    });

    it('should reject look with name too long', () => {
      const invalidLook = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'A'.repeat(101), // > 100 characters
        description: 'A beautiful wall design',
        baseModelId: 'base-model-123',
        appliedModels: [],
        billOfMaterials: [],
        thumbnailUrl: 'https://example.com/thumbnail.png',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = validateLook(invalidLook);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Name must be at most 100 characters');
    });
  });
});

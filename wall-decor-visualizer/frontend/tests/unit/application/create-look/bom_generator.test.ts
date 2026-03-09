import { describe, it, expect } from 'vitest';
import {
  generateBillOfMaterials,
  groupBOMByCategory,
  formatCurrency,
  formatDimensions,
  formatCoverageArea,
} from '../../../../src/data-service/application/create-look/bom_generator';
import {
  IAppliedModel,
  ICatalogItem,
} from '../../../../src/data-service/domain/create-look/create_look_schema';

describe('BOM Generator', () => {
  const mockCatalogItems: ICatalogItem[] = [
    {
      id: 'PANEL001',
      name: 'Wall Panel A',
      description: 'Test panel',
      category: 'panels',
      dimensions: { width: 2, height: 4, depth: 0.5 },
      unitCost: 50,
      thumbnailUrl: 'http://example.com/thumb.png',
      modelUrl: 'http://example.com/model.glb',
      filePath: '/models/PANEL001_2X4X0.5_FT.glb',
      tags: ['panel'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'LIGHT001',
      name: 'LED Light',
      description: 'Test light',
      category: 'lights',
      dimensions: { width: 1, height: 1, depth: 0.25 },
      unitCost: 25,
      thumbnailUrl: 'http://example.com/thumb.png',
      modelUrl: 'http://example.com/model.glb',
      filePath: '/models/LIGHT001_1X1X0.25_FT.glb',
      tags: ['light'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockAppliedModels: IAppliedModel[] = [
    {
      id: 'model-1',
      catalogItemId: 'PANEL001',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      quantity: 5,
      manualQuantity: false,
      placementMethod: 'pen',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'model-2',
      catalogItemId: 'PANEL001',
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      quantity: 3,
      manualQuantity: false,
      placementMethod: 'pen',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'model-3',
      catalogItemId: 'LIGHT001',
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      quantity: 2,
      manualQuantity: false,
      placementMethod: 'pen',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  describe('generateBillOfMaterials', () => {
    it('should aggregate quantities by catalog item ID', () => {
      const result = generateBillOfMaterials(mockAppliedModels, mockCatalogItems);

      expect(result.items).toHaveLength(2);
      
      const panelItem = result.items.find(item => item.catalogItemId === 'PANEL001');
      expect(panelItem).toBeDefined();
      expect(panelItem!.quantity).toBe(8); // 5 + 3
      expect(panelItem!.instances).toBe(2); // 2 instances
    });

    it('should calculate grand totals correctly', () => {
      const result = generateBillOfMaterials(mockAppliedModels, mockCatalogItems);

      expect(result.grandTotal.totalItems).toBe(2);
      expect(result.grandTotal.totalQuantity).toBe(10); // 8 panels + 2 lights
      expect(result.grandTotal.totalCost).toBe(450); // (8 * 50) + (2 * 25)
    });

    it('should sort by category then by name', () => {
      const result = generateBillOfMaterials(mockAppliedModels, mockCatalogItems);

      // Panels should come before lights based on category order
      expect(result.items[0].category).toBe('panels');
      expect(result.items[1].category).toBe('lights');
    });

    it('should handle empty applied models', () => {
      const result = generateBillOfMaterials([], mockCatalogItems);

      expect(result.items).toHaveLength(0);
      expect(result.grandTotal.totalItems).toBe(0);
      expect(result.grandTotal.totalQuantity).toBe(0);
      expect(result.grandTotal.totalCost).toBe(0);
    });

    it('should skip models with missing catalog items', () => {
      const modelsWithMissing: IAppliedModel[] = [
        ...mockAppliedModels,
        {
          id: 'model-4',
          catalogItemId: 'NONEXISTENT',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          quantity: 10,
          manualQuantity: false,
          placementMethod: 'pen',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const result = generateBillOfMaterials(modelsWithMissing, mockCatalogItems);

      // Should still have only 2 items (missing one is skipped)
      expect(result.items).toHaveLength(2);
    });

    it('should calculate coverage area correctly', () => {
      const result = generateBillOfMaterials(mockAppliedModels, mockCatalogItems);

      const panelItem = result.items.find(item => item.catalogItemId === 'PANEL001');
      expect(panelItem).toBeDefined();
      // Coverage = quantity * width * height = 8 * 2 * 4 = 64
      expect(panelItem!.coverageArea).toBe(64);
    });

    it('should handle items without unit cost', () => {
      const itemsWithoutCost: ICatalogItem[] = [
        {
          ...mockCatalogItems[0],
          unitCost: undefined,
        },
      ];

      const models: IAppliedModel[] = [mockAppliedModels[0]];

      const result = generateBillOfMaterials(models, itemsWithoutCost);

      expect(result.items[0].unitCost).toBeUndefined();
      expect(result.items[0].totalCost).toBeUndefined();
    });
  });

  describe('groupBOMByCategory', () => {
    it('should group items by category', () => {
      const bom = generateBillOfMaterials(mockAppliedModels, mockCatalogItems);
      const grouped = groupBOMByCategory(bom.items);

      expect(grouped.size).toBe(2);
      expect(grouped.has('panels')).toBe(true);
      expect(grouped.has('lights')).toBe(true);
      expect(grouped.get('panels')!.length).toBe(1);
      expect(grouped.get('lights')!.length).toBe(1);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency values', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should return N/A for undefined', () => {
      expect(formatCurrency(undefined)).toBe('N/A');
    });
  });

  describe('formatDimensions', () => {
    it('should format dimensions correctly', () => {
      const dimensions = { width: 2.5, height: 4.0, depth: 0.5 };
      expect(formatDimensions(dimensions)).toBe("2.50' × 4.00' × 0.50'");
    });
  });

  describe('formatCoverageArea', () => {
    it('should format coverage area correctly', () => {
      expect(formatCoverageArea(64.5)).toBe('64.50 sq ft');
      expect(formatCoverageArea(100)).toBe('100.00 sq ft');
    });
  });
});

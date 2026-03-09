/**
 * Bill of Materials (BOM) Generator Service
 * 
 * Generates aggregated Bill of Materials from applied models and catalog items.
 * 
 * Features:
 * - Aggregates quantities by catalog item ID
 * - Calculates grand totals (items, quantity, cost, coverage)
 * - Sorts by category then by name
 * - Handles missing catalog items gracefully
 */

import {
  IAppliedModel,
  IBOMItem,
  ICatalogItem,
  CatalogCategory,
} from '../../domain/create-look/create_look_schema';

/**
 * Grand total summary for BOM
 */
export interface IGrandTotal {
  totalItems: number; // Number of unique catalog items
  totalQuantity: number; // Sum of all quantities
  totalCost: number; // Sum of all costs (if available)
  totalCoverageArea: number; // Sum of all coverage areas
}

/**
 * BOM generation result
 */
export interface IBOMResult {
  items: IBOMItem[];
  grandTotal: IGrandTotal;
  generatedAt: string;
}

/**
 * Category order for sorting
 */
const CATEGORY_ORDER: Record<CatalogCategory, number> = {
  panels: 1,
  lights: 2,
  cove: 3,
  bidding: 4,
  artwork: 5,
  other: 6,
};

/**
 * Generate Bill of Materials from applied models
 * 
 * @param appliedModels - All applied models in the look
 * @param catalogItems - Catalog item metadata
 * @returns Aggregated BOM with grand totals
 */
export function generateBillOfMaterials(
  appliedModels: IAppliedModel[],
  catalogItems: ICatalogItem[]
): IBOMResult {
  // Validate inputs
  if (!Array.isArray(appliedModels)) {
    throw new Error('appliedModels must be an array');
  }
  if (!Array.isArray(catalogItems)) {
    throw new Error('catalogItems must be an array');
  }

  // Create map to aggregate quantities by catalog item
  const bomMap = new Map<string, IBOMItem>();

  // Iterate through all applied models
  for (const appliedModel of appliedModels) {
    const catalogItemId = appliedModel.catalogItemId;

    // Find catalog item metadata
    const catalogItem = catalogItems.find((item) => item.id === catalogItemId);

    if (!catalogItem) {
      // Skip if catalog item not found
      console.warn(`Catalog item not found for ID: ${catalogItemId}`);
      continue;
    }

    // Check if item already in BOM
    if (bomMap.has(catalogItemId)) {
      // Aggregate quantity
      const existingItem = bomMap.get(catalogItemId)!;
      existingItem.quantity += appliedModel.quantity;
      existingItem.instances += 1;
      existingItem.coverageArea +=
        appliedModel.quantity *
        catalogItem.dimensions.width *
        catalogItem.dimensions.height;

      // Recalculate total cost
      if (existingItem.unitCost !== undefined) {
        existingItem.totalCost = existingItem.quantity * existingItem.unitCost;
      }
    } else {
      // Create new BOM item
      const bomItem: IBOMItem = {
        catalogItemId: catalogItemId,
        name: catalogItem.name,
        category: catalogItem.category,
        quantity: appliedModel.quantity,
        unitCost: catalogItem.unitCost,
        totalCost:
          catalogItem.unitCost !== undefined
            ? appliedModel.quantity * catalogItem.unitCost
            : undefined,
        dimensions: catalogItem.dimensions,
        instances: 1,
        coverageArea:
          appliedModel.quantity *
          catalogItem.dimensions.width *
          catalogItem.dimensions.height,
      };

      bomMap.set(catalogItemId, bomItem);
    }
  }

  // Convert map to array
  const bomArray = Array.from(bomMap.values());

  // Sort by category, then by name
  bomArray.sort((a, b) => {
    if (a.category !== b.category) {
      return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    }
    return a.name.localeCompare(b.name);
  });

  // Calculate grand totals
  const grandTotal: IGrandTotal = {
    totalItems: bomArray.length,
    totalQuantity: 0,
    totalCost: 0,
    totalCoverageArea: 0,
  };

  for (const item of bomArray) {
    grandTotal.totalQuantity += item.quantity;
    if (item.totalCost !== undefined) {
      grandTotal.totalCost += item.totalCost;
    }
    grandTotal.totalCoverageArea += item.coverageArea;
  }

  return {
    items: bomArray,
    grandTotal: grandTotal,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Group BOM items by category
 * 
 * @param bomItems - BOM items to group
 * @returns Map of category to items
 */
export function groupBOMByCategory(
  bomItems: IBOMItem[]
): Map<CatalogCategory, IBOMItem[]> {
  const grouped = new Map<CatalogCategory, IBOMItem[]>();

  for (const item of bomItems) {
    const category = item.category;
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(item);
  }

  return grouped;
}

/**
 * Format currency value
 * 
 * @param value - Numeric value
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined) {
    return 'N/A';
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format dimensions
 * 
 * @param dimensions - Dimensions object
 * @returns Formatted dimensions string
 */
export function formatDimensions(dimensions: {
  width: number;
  height: number;
  depth: number;
}): string {
  return `${dimensions.width.toFixed(2)}' × ${dimensions.height.toFixed(2)}' × ${dimensions.depth.toFixed(2)}'`;
}

/**
 * Format coverage area
 * 
 * @param area - Area in square feet
 * @returns Formatted area string
 */
export function formatCoverageArea(area: number): string {
  return `${area.toFixed(2)} sq ft`;
}

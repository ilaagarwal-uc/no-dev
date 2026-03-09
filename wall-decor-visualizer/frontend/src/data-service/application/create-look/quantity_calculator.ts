/**
 * Quantity Calculator Service
 * 
 * Calculates material quantities based on marked dimensions, item specifications,
 * and 6-inch grid alignment.
 * 
 * Supports:
 * - Panel-type calculation (area-based)
 * - Linear-type calculation (length-based)
 * - Point-type calculation (spacing-based)
 */

import {
  IAppliedModel,
  ICatalogItem,
  IMarkedDimensions,
  IQuantityResult,
} from '../../domain/create-look/create_look_schema';

/**
 * Calculate quantity needed for an applied model
 * 
 * @param appliedModel - The applied model instance with scale information
 * @param catalogItem - The catalog item with dimensions and category
 * @param markedDimensions - The marked wall dimensions
 * @returns Quantity result with calculation details
 */
export function calculateQuantity(
  appliedModel: IAppliedModel,
  catalogItem: ICatalogItem,
  markedDimensions: IMarkedDimensions
): IQuantityResult {
  // Validate inputs
  if (!appliedModel || !catalogItem || !markedDimensions) {
    throw new Error('Invalid input: appliedModel, catalogItem, and markedDimensions are required');
  }

  if (markedDimensions.area <= 0) {
    throw new Error('Invalid marked dimensions: area must be positive');
  }

  // Determine calculation method based on category
  const category = catalogItem.category;

  switch (category) {
    case 'panels':
      return calculatePanelQuantity(appliedModel, catalogItem, markedDimensions);
    
    case 'bidding':
    case 'cove':
      return calculateLinearQuantity(appliedModel, catalogItem, markedDimensions);
    
    case 'lights':
      return calculatePointQuantity(appliedModel, catalogItem, markedDimensions);
    
    case 'artwork':
    case 'other':
    default:
      return calculateCustomQuantity(appliedModel, catalogItem, markedDimensions);
  }
}

/**
 * Calculate quantity for panel-type items (area-based)
 * Formula: ceil(marked_area / panel_area)
 */
function calculatePanelQuantity(
  appliedModel: IAppliedModel,
  catalogItem: ICatalogItem,
  markedDimensions: IMarkedDimensions
): IQuantityResult {
  // Calculate panel dimensions with scale applied
  const panelWidth = catalogItem.dimensions.width * appliedModel.scale.x;
  const panelHeight = catalogItem.dimensions.height * appliedModel.scale.y;
  const panelArea = panelWidth * panelHeight;

  // Ensure panel area is positive
  if (panelArea <= 0) {
    return {
      quantity: 1,
      unit: 'pieces',
      coverageArea: 0,
      calculationMethod: 'panel',
      notes: 'Invalid panel dimensions, defaulting to 1 piece',
    };
  }

  // Calculate how many panels needed to cover marked area
  const quantity = Math.ceil(markedDimensions.area / panelArea);

  // Ensure at least 1
  const finalQuantity = Math.max(1, quantity);

  return {
    quantity: finalQuantity,
    unit: 'pieces',
    coverageArea: finalQuantity * panelArea,
    calculationMethod: 'panel',
    notes: `${finalQuantity} panel${finalQuantity > 1 ? 's' : ''} needed to cover ${markedDimensions.area.toFixed(1)} sq ft`,
  };
}

/**
 * Calculate quantity for linear items (length-based)
 * Formula: ceil(marked_perimeter / item_length)
 */
function calculateLinearQuantity(
  appliedModel: IAppliedModel,
  catalogItem: ICatalogItem,
  markedDimensions: IMarkedDimensions
): IQuantityResult {
  // Calculate item length with scale applied
  const itemLength = catalogItem.dimensions.width * appliedModel.scale.x;

  // Ensure item length is positive
  if (itemLength <= 0) {
    return {
      quantity: 1,
      unit: 'linear_feet',
      coverageArea: 0,
      calculationMethod: 'linear',
      notes: 'Invalid item length, defaulting to 1 piece',
    };
  }

  // Calculate perimeter of marked area
  const perimeter = 2 * (markedDimensions.width + markedDimensions.height);

  // Calculate how many linear pieces needed
  const quantity = Math.ceil(perimeter / itemLength);

  // Ensure at least 1
  const finalQuantity = Math.max(1, quantity);

  return {
    quantity: finalQuantity,
    unit: 'linear_feet',
    coverageArea: finalQuantity * itemLength,
    calculationMethod: 'linear',
    notes: `${finalQuantity} piece${finalQuantity > 1 ? 's' : ''} needed for ${perimeter.toFixed(1)} ft perimeter`,
  };
}

/**
 * Calculate quantity for point items (spacing-based)
 * Formula: ceil(marked_area / spacing_area)
 * Default spacing: 1 light per 16 square feet (4ft x 4ft spacing)
 */
function calculatePointQuantity(
  appliedModel: IAppliedModel,
  catalogItem: ICatalogItem,
  markedDimensions: IMarkedDimensions
): IQuantityResult {
  // Assume 1 light per 16 square feet (4ft x 4ft spacing)
  const spacingArea = 16; // square feet

  // Calculate how many lights needed
  const quantity = Math.ceil(markedDimensions.area / spacingArea);

  // Ensure at least 1
  const finalQuantity = Math.max(1, quantity);

  return {
    quantity: finalQuantity,
    unit: 'pieces',
    coverageArea: markedDimensions.area,
    calculationMethod: 'point',
    notes: `${finalQuantity} light${finalQuantity > 1 ? 's' : ''} for ${markedDimensions.area.toFixed(1)} sq ft (1 per 16 sq ft)`,
  };
}

/**
 * Calculate quantity for custom/other items
 * Defaults to 1 piece with manual adjustment recommended
 */
function calculateCustomQuantity(
  appliedModel: IAppliedModel,
  catalogItem: ICatalogItem,
  markedDimensions: IMarkedDimensions
): IQuantityResult {
  return {
    quantity: 1,
    unit: 'pieces',
    coverageArea: 0,
    calculationMethod: 'custom',
    notes: 'Manual quantity adjustment recommended',
  };
}

/**
 * Recalculate quantity when scale changes
 * 
 * @param appliedModel - The applied model with updated scale
 * @param catalogItem - The catalog item
 * @param markedDimensions - The marked wall dimensions
 * @returns Updated quantity result
 */
export function recalculateQuantityOnScaleChange(
  appliedModel: IAppliedModel,
  catalogItem: ICatalogItem,
  markedDimensions: IMarkedDimensions
): IQuantityResult {
  // Only recalculate if quantity is not manually adjusted
  if (appliedModel.manualQuantity) {
    return {
      quantity: appliedModel.quantity,
      unit: 'pieces',
      coverageArea: 0,
      calculationMethod: 'custom',
      notes: 'Manual quantity preserved',
    };
  }

  // Recalculate using the standard calculation
  return calculateQuantity(appliedModel, catalogItem, markedDimensions);
}

/**
 * Set manual quantity override
 * 
 * @param appliedModel - The applied model to update
 * @param manualQuantity - The manual quantity value
 * @returns Updated applied model
 */
export function setManualQuantity(
  appliedModel: IAppliedModel,
  manualQuantity: number
): IAppliedModel {
  if (manualQuantity < 1) {
    throw new Error('Manual quantity must be at least 1');
  }

  return {
    ...appliedModel,
    quantity: Math.floor(manualQuantity),
    manualQuantity: true,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Clear manual quantity override and recalculate
 * 
 * @param appliedModel - The applied model to update
 * @param catalogItem - The catalog item
 * @param markedDimensions - The marked wall dimensions
 * @returns Updated applied model with recalculated quantity
 */
export function clearManualQuantity(
  appliedModel: IAppliedModel,
  catalogItem: ICatalogItem,
  markedDimensions: IMarkedDimensions
): IAppliedModel {
  const quantityResult = calculateQuantity(appliedModel, catalogItem, markedDimensions);

  return {
    ...appliedModel,
    quantity: quantityResult.quantity,
    manualQuantity: false,
    updatedAt: new Date().toISOString(),
  };
}

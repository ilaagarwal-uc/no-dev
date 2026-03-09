// Domain logic for model generation validation and operations
import * as ModelGenerationSchema from './model_generation_schema.js';

// Validation functions
export function validateDimensionData(data: ModelGenerationSchema.IDimensionData): boolean {
  if (!data) {
    return true; // Allow empty dimension data
  }
  
  if (!Array.isArray(data.elements)) {
    return false;
  }
  
  // Allow empty elements array (user skipped dimension marking)
  if (data.elements.length === 0) {
    return true;
  }
  
  // If elements exist, validate them
  return data.elements.every(el => validateElement(el));
}

export function validateElement(element: ModelGenerationSchema.IElement): boolean {
  return (
    !!element.id &&
    !!element.category &&
    !!element.type &&
    !!element.origin &&
    !!element.dimensions &&
    element.dimensions.width > 0 &&
    element.dimensions.height > 0
  );
}

export function validateGenerateRequest(
  request: ModelGenerationSchema.IGenerateModelRequest
): boolean {
  return (
    !!request.userId &&
    !!request.imageId &&
    !!request.imageUrl &&
    validateDimensionData(request.dimensionData)
  );
}

// Business logic functions
export function calculateModelComplexity(data: ModelGenerationSchema.IDimensionData): number {
  // Calculate complexity score based on number and types of elements
  let complexity = 0;
  
  data.elements.forEach(el => {
    if (el.type === 'MAIN_WALL' || el.type === 'RETURN_WALL') {
      complexity += 1;
    } else if (el.type === 'ARCH_OPENING' || el.type === 'DOOR_ARCH') {
      complexity += 3; // Arches are more complex
    } else {
      complexity += 2;
    }
  });
  
  return complexity;
}

export function estimateProcessingTime(complexity: number): number {
  // Estimate processing time in seconds based on complexity
  const baseTime = 10; // 10 seconds base
  const perElementTime = 2; // 2 seconds per complexity point
  return baseTime + (complexity * perElementTime);
}

// Export all schema types
export type {
  IGenerateModelRequest,
  IGenerateModelResponse,
  IDimensionData,
  IElement,
  ElementCategory,
  ElementType,
  Side,
  Direction,
  ArchShape,
  Orientation,
  IPoint3D,
  IDimensions,
  IJobStatus,
  JobStatusType,
  IModelMetadata
} from './model_generation_schema.js';

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

export type CatalogCategory = 'panels' | 'lights' | 'cove' | 'bidding' | 'artwork' | 'other';

export type ViewMode = 'perspective' | 'orthographic' | 'wireframe';

export type PlacementMethod = 'pen' | 'mouse' | 'touch';

export type QuantityUnit = 'pieces' | 'linear_feet' | 'square_feet';

export type CalculationMethod = 'panel' | 'linear' | 'point' | 'custom';

// ============================================================================
// Core Interfaces
// ============================================================================

export interface ICatalogItem {
  id: string; // Extracted from filename (e.g., "WX919")
  name: string; // Generated from ID or metadata
  description: string;
  category: CatalogCategory;
  dimensions: {
    width: number; // In feet, extracted from filename
    height: number; // In feet, extracted from filename
    depth: number; // In feet, extracted from filename
  };
  unitCost?: number;
  thumbnailUrl: string; // /models/{id}_thumb.png or auto-generated
  modelUrl: string; // /models/{filename}.glb
  filePath: string; // Relative path in /models folder
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IAppliedModel {
  id: string; // Unique instance ID (UUID)
  catalogItemId: string; // Reference to catalog item
  position: {
    x: number; // In Three.js units
    y: number;
    z: number;
  };
  rotation: {
    x: number; // In degrees
    y: number;
    z: number;
  };
  scale: {
    x: number; // Multiplier (1.0 = original size)
    y: number;
    z: number;
  };
  quantity: number; // Calculated or manual
  manualQuantity: boolean; // True if user overrode calculation
  penPressure?: number; // Pressure used during placement (0-1)
  placementMethod: PlacementMethod;
  createdAt: string;
  updatedAt: string;
}

export interface ITransform {
  position?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number; // Degrees
    y: number;
    z: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface IBOMItem {
  catalogItemId: string;
  name: string;
  category: CatalogCategory;
  quantity: number; // Aggregated total
  unitCost?: number;
  totalCost?: number; // quantity * unitCost
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  instances: number; // Number of times applied in look
  coverageArea: number; // Total area covered
}

export interface ILook {
  id: string; // UUID
  userId: string; // UUID
  name: string;
  description: string;
  baseModelId: string; // Reference to base wall model
  appliedModels: IAppliedModel[];
  billOfMaterials: IBOMItem[];
  thumbnailUrl: string; // Screenshot of the look
  shareLink?: string; // Shareable URL
  version: number; // Version history
  createdAt: string;
  updatedAt: string;
}

export interface IMarkedDimensions {
  width: number; // In feet
  height: number; // In feet
  area: number; // In square feet
}

export interface IQuantityResult {
  quantity: number;
  unit: QuantityUnit;
  coverageArea: number;
  calculationMethod: CalculationMethod;
  notes?: string;
}

export interface IModelMetadata {
  width: number;
  height: number;
  depth: number;
  polygonCount?: number;
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

// Catalog Category Schema
export const CatalogCategorySchema = z.enum(['panels', 'lights', 'cove', 'bidding', 'artwork', 'other']);

// View Mode Schema
export const ViewModeSchema = z.enum(['perspective', 'orthographic', 'wireframe']);

// Placement Method Schema
export const PlacementMethodSchema = z.enum(['pen', 'mouse', 'touch']);

// Dimensions Schema
export const DimensionsSchema = z.object({
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  depth: z.number().nonnegative('Depth must be non-negative'),
});

// Catalog Item Schema
export const CatalogItemSchema = z.object({
  id: z.string().min(1, 'ID must be non-empty'),
  name: z.string().min(1, 'Name must be non-empty'),
  description: z.string(),
  category: CatalogCategorySchema,
  dimensions: DimensionsSchema,
  unitCost: z.number().nonnegative('Unit cost must be non-negative').optional(),
  thumbnailUrl: z.string().url('Thumbnail URL must be valid'),
  modelUrl: z.string().url('Model URL must be valid'),
  filePath: z.string().min(1, 'File path must be non-empty'),
  tags: z.array(z.string()),
  createdAt: z.string().datetime('Created at must be valid ISO datetime'),
  updatedAt: z.string().datetime('Updated at must be valid ISO datetime'),
});

// Position Schema
export const PositionSchema = z.object({
  x: z.number().finite('X must be finite'),
  y: z.number().finite('Y must be finite'),
  z: z.number().finite('Z must be finite'),
});

// Rotation Schema (degrees)
export const RotationSchema = z.object({
  x: z.number().finite('X rotation must be finite'),
  y: z.number().finite('Y rotation must be finite'),
  z: z.number().finite('Z rotation must be finite'),
});

// Scale Schema
export const ScaleSchema = z.object({
  x: z.number().min(0.1, 'X scale must be at least 0.1').max(10.0, 'X scale must be at most 10.0'),
  y: z.number().min(0.1, 'Y scale must be at least 0.1').max(10.0, 'Y scale must be at most 10.0'),
  z: z.number().min(0.1, 'Z scale must be at least 0.1').max(10.0, 'Z scale must be at most 10.0'),
});

// Applied Model Schema
export const AppliedModelSchema = z.object({
  id: z.string().uuid('ID must be valid UUID'),
  catalogItemId: z.string().min(1, 'Catalog item ID must be non-empty'),
  position: PositionSchema,
  rotation: RotationSchema,
  scale: ScaleSchema,
  quantity: z.number().int('Quantity must be integer').positive('Quantity must be positive'),
  manualQuantity: z.boolean(),
  penPressure: z.number().min(0.0).max(1.0).optional(),
  placementMethod: PlacementMethodSchema,
  createdAt: z.string().datetime('Created at must be valid ISO datetime'),
  updatedAt: z.string().datetime('Updated at must be valid ISO datetime'),
});

// Transform Schema
export const TransformSchema = z.object({
  position: PositionSchema.optional(),
  rotation: RotationSchema.optional(),
  scale: ScaleSchema.optional(),
}).refine(
  (data: { position?: unknown; rotation?: unknown; scale?: unknown }) => data.position || data.rotation || data.scale,
  { message: 'At least one property (position, rotation, or scale) must be present' }
);

// BOM Item Schema
export const BOMItemSchema = z.object({
  catalogItemId: z.string().min(1, 'Catalog item ID must be non-empty'),
  name: z.string().min(1, 'Name must be non-empty'),
  category: CatalogCategorySchema,
  quantity: z.number().int('Quantity must be integer').positive('Quantity must be positive'),
  unitCost: z.number().nonnegative('Unit cost must be non-negative').optional(),
  totalCost: z.number().nonnegative('Total cost must be non-negative').optional(),
  dimensions: DimensionsSchema,
  instances: z.number().int('Instances must be integer').positive('Instances must be positive'),
  coverageArea: z.number().nonnegative('Coverage area must be non-negative'),
}).refine(
  (data: { unitCost?: number; totalCost?: number; quantity: number }) => {
    if (data.unitCost !== undefined && data.totalCost !== undefined && data.quantity > 0) {
      return Math.abs(data.totalCost - (data.quantity * data.unitCost)) < 0.01;
    }
    return true;
  },
  { message: 'Total cost must equal quantity * unitCost' }
);

// Look Schema
export const LookSchema = z.object({
  id: z.string().uuid('ID must be valid UUID'),
  userId: z.string().uuid('User ID must be valid UUID'),
  name: z.string().min(1, 'Name must be non-empty').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters'),
  baseModelId: z.string().min(1, 'Base model ID must be non-empty'),
  appliedModels: z.array(AppliedModelSchema),
  billOfMaterials: z.array(BOMItemSchema),
  thumbnailUrl: z.string().url('Thumbnail URL must be valid'),
  shareLink: z.string().url('Share link must be valid').optional(),
  version: z.number().int('Version must be integer').positive('Version must be positive'),
  createdAt: z.string().datetime('Created at must be valid ISO datetime'),
  updatedAt: z.string().datetime('Updated at must be valid ISO datetime'),
});

// Marked Dimensions Schema
export const MarkedDimensionsSchema = z.object({
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  area: z.number().positive('Area must be positive'),
});

// Quantity Result Schema
export const QuantityResultSchema = z.object({
  quantity: z.number().int('Quantity must be integer').positive('Quantity must be positive'),
  unit: z.enum(['pieces', 'linear_feet', 'square_feet']),
  coverageArea: z.number().nonnegative('Coverage area must be non-negative'),
  calculationMethod: z.enum(['panel', 'linear', 'point', 'custom']),
  notes: z.string().optional(),
});

// Model Metadata Schema
export const ModelMetadataSchema = z.object({
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  depth: z.number().nonnegative('Depth must be non-negative'),
  polygonCount: z.number().int('Polygon count must be integer').nonnegative('Polygon count must be non-negative').optional(),
  boundingBox: z.object({
    min: PositionSchema,
    max: PositionSchema,
  }).optional(),
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates a catalog item and returns validation result
 */
export function validateCatalogItem(data: unknown): { success: boolean; data?: ICatalogItem; error?: string } {
  const result = CatalogItemSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((e: { message: string }) => e.message).join(', ') };
}

/**
 * Validates an applied model and returns validation result
 */
export function validateAppliedModel(data: unknown): { success: boolean; data?: IAppliedModel; error?: string } {
  const result = AppliedModelSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((e: { message: string }) => e.message).join(', ') };
}

/**
 * Validates a transform and returns validation result
 */
export function validateTransform(data: unknown): { success: boolean; data?: ITransform; error?: string } {
  const result = TransformSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((e: { message: string }) => e.message).join(', ') };
}

/**
 * Validates a BOM item and returns validation result
 */
export function validateBOMItem(data: unknown): { success: boolean; data?: IBOMItem; error?: string } {
  const result = BOMItemSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((e: { message: string }) => e.message).join(', ') };
}

/**
 * Validates a look and returns validation result
 */
export function validateLook(data: unknown): { success: boolean; data?: ILook; error?: string } {
  const result = LookSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((e: { message: string }) => e.message).join(', ') };
}

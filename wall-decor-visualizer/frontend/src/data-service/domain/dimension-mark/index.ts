// Domain logic for dimension marking validation and operations
import * as DimensionMarkSchema from './dimension_mark_schema.js';

// Validation functions
export function validateAnnotations(annotations: DimensionMarkSchema.IAnnotation[]): boolean {
  return Array.isArray(annotations) && annotations.length >= 0;
}

export function validateImageUrl(imageUrl: string): boolean {
  return typeof imageUrl === 'string' && imageUrl.length > 0;
}

export function validateSaveRequest(request: DimensionMarkSchema.ISaveDimensionsRequest): boolean {
  return (
    validateImageUrl(request.imageUrl) &&
    validateAnnotations(request.annotations) &&
    request.mergedImageBlob instanceof Blob
  );
}

export function validateSkipRequest(request: DimensionMarkSchema.ISkipDimensionsRequest): boolean {
  return validateImageUrl(request.imageUrl);
}

// Annotation operations
export function createAnnotation(
  type: DimensionMarkSchema.AnnotationType,
  data: any
): DimensionMarkSchema.IAnnotation {
  return {
    id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function updateAnnotation(
  annotation: DimensionMarkSchema.IAnnotation,
  updates: Partial<DimensionMarkSchema.IAnnotation>
): DimensionMarkSchema.IAnnotation {
  return {
    ...annotation,
    ...updates,
    updatedAt: Date.now()
  };
}

export function deleteAnnotation(
  annotations: DimensionMarkSchema.IAnnotation[],
  id: string
): DimensionMarkSchema.IAnnotation[] {
  return annotations.filter(ann => ann.id !== id);
}

export function getAnnotationById(
  annotations: DimensionMarkSchema.IAnnotation[],
  id: string
): DimensionMarkSchema.IAnnotation | undefined {
  return annotations.find(ann => ann.id === id);
}

// Export all schema types
export type {
  IPoint,
  IAnnotation,
  AnnotationType,
  IPolygon,
  IDimension,
  IFreehand,
  IArch,
  IConcaveCorner,
  IConvexCorner,
  ISaveDimensionsRequest,
  ISkipDimensionsRequest,
  ISaveDimensionsResponse,
  ISkipDimensionsResponse
} from './dimension_mark_schema.js';

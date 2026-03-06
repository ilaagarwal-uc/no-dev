// Coordinate system transformations and synchronization
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

export function transformCoordinatesToImage(
  canvasCoords: DimensionMarkDomain.IPoint,
  zoom: number,
  pan: DimensionMarkDomain.IPoint,
  imageWidth: number,
  imageHeight: number
): DimensionMarkDomain.IPoint {
  // Convert canvas coordinates to image coordinates
  const imageX = (canvasCoords.x - pan.x) / (zoom / 100);
  const imageY = (canvasCoords.y - pan.y) / (zoom / 100);

  // Clamp to image bounds
  return {
    x: Math.max(0, Math.min(imageWidth - 1, imageX)),
    y: Math.max(0, Math.min(imageHeight - 1, imageY))
  };
}

export function transformCoordinatesToCanvas(
  imageCoords: DimensionMarkDomain.IPoint,
  zoom: number,
  pan: DimensionMarkDomain.IPoint
): DimensionMarkDomain.IPoint {
  // Convert image coordinates to canvas coordinates
  return {
    x: imageCoords.x * (zoom / 100) + pan.x,
    y: imageCoords.y * (zoom / 100) + pan.y
  };
}

export function scaleAnnotationForZoom(
  annotation: DimensionMarkDomain.IAnnotation,
  oldZoom: number,
  newZoom: number
): DimensionMarkDomain.IAnnotation {
  // Annotations are stored in image coordinates, so no scaling needed
  // Just update the updatedAt timestamp
  return {
    ...annotation,
    updatedAt: Date.now()
  };
}

export function syncAnnotationsAfterZoom(
  annotations: DimensionMarkDomain.IAnnotation[],
  oldZoom: number,
  newZoom: number
): DimensionMarkDomain.IAnnotation[] {
  // Annotations are stored in image coordinates, so they remain unchanged
  return annotations;
}

export function syncAnnotationsAfterPan(
  annotations: DimensionMarkDomain.IAnnotation[],
  panOffset: DimensionMarkDomain.IPoint
): DimensionMarkDomain.IAnnotation[] {
  // Annotations are stored in image coordinates, so pan doesn't affect them
  return annotations;
}

export function getImageBounds(
  imageWidth: number,
  imageHeight: number,
  zoom: number,
  pan: DimensionMarkDomain.IPoint
): { minX: number; maxX: number; minY: number; maxY: number } {
  const scaledWidth = imageWidth * (zoom / 100);
  const scaledHeight = imageHeight * (zoom / 100);

  return {
    minX: pan.x,
    maxX: pan.x + scaledWidth,
    minY: pan.y,
    maxY: pan.y + scaledHeight
  };
}

export function clampCoordinatesToImage(
  point: DimensionMarkDomain.IPoint,
  imageWidth: number,
  imageHeight: number
): DimensionMarkDomain.IPoint {
  return {
    x: Math.max(0, Math.min(imageWidth - 1, point.x)),
    y: Math.max(0, Math.min(imageHeight - 1, point.y))
  };
}

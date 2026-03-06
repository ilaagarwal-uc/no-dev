// Annotation CRUD operations
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

export function createAnnotation(
  type: DimensionMarkDomain.AnnotationType,
  data: any
): DimensionMarkDomain.IAnnotation {
  return DimensionMarkDomain.createAnnotation(type, data);
}

export function updateAnnotation(
  annotation: DimensionMarkDomain.IAnnotation,
  updates: Partial<DimensionMarkDomain.IAnnotation>
): DimensionMarkDomain.IAnnotation {
  return DimensionMarkDomain.updateAnnotation(annotation, updates);
}

export function deleteAnnotation(
  annotations: DimensionMarkDomain.IAnnotation[],
  id: string
): DimensionMarkDomain.IAnnotation[] {
  return DimensionMarkDomain.deleteAnnotation(annotations, id);
}

export function getAnnotationById(
  annotations: DimensionMarkDomain.IAnnotation[],
  id: string
): DimensionMarkDomain.IAnnotation | undefined {
  return DimensionMarkDomain.getAnnotationById(annotations, id);
}

export function moveAnnotation(
  annotation: DimensionMarkDomain.IAnnotation,
  offset: DimensionMarkDomain.IPoint
): DimensionMarkDomain.IAnnotation {
  // Move annotation by offset
  const data = annotation.data;
  let newData = data;

  if (annotation.type === 'polygon') {
    const polygon = data as DimensionMarkDomain.IPolygon;
    newData = {
      ...polygon,
      vertices: polygon.vertices.map(v => ({
        x: v.x + offset.x,
        y: v.y + offset.y
      }))
    };
  } else if (annotation.type === 'dimension') {
    const dimension = data as DimensionMarkDomain.IDimension;
    newData = {
      ...dimension,
      startPoint: {
        x: dimension.startPoint.x + offset.x,
        y: dimension.startPoint.y + offset.y
      },
      endPoint: {
        x: dimension.endPoint.x + offset.x,
        y: dimension.endPoint.y + offset.y
      }
    };
  } else if (annotation.type === 'freehand') {
    const freehand = data as DimensionMarkDomain.IFreehand;
    newData = {
      ...freehand,
      points: freehand.points.map(p => ({
        x: p.x + offset.x,
        y: p.y + offset.y
      }))
    };
  } else if (annotation.type === 'arch') {
    const arch = data as DimensionMarkDomain.IArch;
    newData = {
      ...arch,
      circumferencePoints: [
        {
          x: arch.circumferencePoints[0].x + offset.x,
          y: arch.circumferencePoints[0].y + offset.y
        },
        {
          x: arch.circumferencePoints[1].x + offset.x,
          y: arch.circumferencePoints[1].y + offset.y
        }
      ],
      centerPoint: {
        x: arch.centerPoint.x + offset.x,
        y: arch.centerPoint.y + offset.y
      }
    };
  } else if (annotation.type === 'concave' || annotation.type === 'convex') {
    const corner = data as DimensionMarkDomain.IConcaveCorner | DimensionMarkDomain.IConvexCorner;
    newData = {
      ...corner,
      point: {
        x: corner.point.x + offset.x,
        y: corner.point.y + offset.y
      }
    };
  }

  return updateAnnotation(annotation, { data: newData });
}

export function scaleAnnotation(
  annotation: DimensionMarkDomain.IAnnotation,
  scaleFactor: number
): DimensionMarkDomain.IAnnotation {
  // Scale annotation by factor
  const data = annotation.data;
  let newData = data;

  if (annotation.type === 'polygon') {
    const polygon = data as DimensionMarkDomain.IPolygon;
    newData = {
      ...polygon,
      vertices: polygon.vertices.map(v => ({
        x: v.x * scaleFactor,
        y: v.y * scaleFactor
      })),
      area: polygon.area * scaleFactor * scaleFactor
    };
  } else if (annotation.type === 'dimension') {
    const dimension = data as DimensionMarkDomain.IDimension;
    newData = {
      ...dimension,
      startPoint: {
        x: dimension.startPoint.x * scaleFactor,
        y: dimension.startPoint.y * scaleFactor
      },
      endPoint: {
        x: dimension.endPoint.x * scaleFactor,
        y: dimension.endPoint.y * scaleFactor
      },
      arrowHeadSize: dimension.arrowHeadSize * scaleFactor
    };
  } else if (annotation.type === 'freehand') {
    const freehand = data as DimensionMarkDomain.IFreehand;
    newData = {
      ...freehand,
      points: freehand.points.map(p => ({
        x: p.x * scaleFactor,
        y: p.y * scaleFactor
      })),
      strokeWidth: freehand.strokeWidth * scaleFactor
    };
  } else if (annotation.type === 'arch') {
    const arch = data as DimensionMarkDomain.IArch;
    newData = {
      ...arch,
      circumferencePoints: [
        {
          x: arch.circumferencePoints[0].x * scaleFactor,
          y: arch.circumferencePoints[0].y * scaleFactor
        },
        {
          x: arch.circumferencePoints[1].x * scaleFactor,
          y: arch.circumferencePoints[1].y * scaleFactor
        }
      ],
      centerPoint: {
        x: arch.centerPoint.x * scaleFactor,
        y: arch.centerPoint.y * scaleFactor
      },
      radius: arch.radius * scaleFactor
    };
  } else if (annotation.type === 'concave' || annotation.type === 'convex') {
    const corner = data as DimensionMarkDomain.IConcaveCorner | DimensionMarkDomain.IConvexCorner;
    newData = {
      ...corner,
      point: {
        x: corner.point.x * scaleFactor,
        y: corner.point.y * scaleFactor
      },
      size: corner.size * scaleFactor
    };
  }

  return updateAnnotation(annotation, { data: newData });
}

export function isPointInAnnotation(
  point: DimensionMarkDomain.IPoint,
  annotation: DimensionMarkDomain.IAnnotation
): boolean {
  const data = annotation.data;

  if (annotation.type === 'polygon') {
    const polygon = data as DimensionMarkDomain.IPolygon;
    return isPointInPolygon(point, polygon.vertices);
  } else if (annotation.type === 'dimension') {
    const dimension = data as DimensionMarkDomain.IDimension;
    return isPointNearLine(point, dimension.startPoint, dimension.endPoint, 5);
  } else if (annotation.type === 'freehand') {
    const freehand = data as DimensionMarkDomain.IFreehand;
    return freehand.points.some(p => distance(point, p) <= freehand.strokeWidth + 2);
  } else if (annotation.type === 'arch') {
    const arch = data as DimensionMarkDomain.IArch;
    return isPointNearArc(point, arch.centerPoint, arch.radius, 5);
  } else if (annotation.type === 'concave' || annotation.type === 'convex') {
    const corner = data as DimensionMarkDomain.IConcaveCorner | DimensionMarkDomain.IConvexCorner;
    return distance(point, corner.point) <= corner.size;
  }

  return false;
}

export function getAnnotationsAtPoint(
  annotations: DimensionMarkDomain.IAnnotation[],
  point: DimensionMarkDomain.IPoint
): DimensionMarkDomain.IAnnotation[] {
  return annotations.filter(ann => isPointInAnnotation(point, ann));
}

// Helper functions
function isPointInPolygon(point: DimensionMarkDomain.IPoint, vertices: DimensionMarkDomain.IPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isPointNearLine(
  point: DimensionMarkDomain.IPoint,
  start: DimensionMarkDomain.IPoint,
  end: DimensionMarkDomain.IPoint,
  threshold: number
): boolean {
  const dist = pointToLineDistance(point, start, end);
  return dist <= threshold;
}

function pointToLineDistance(
  point: DimensionMarkDomain.IPoint,
  start: DimensionMarkDomain.IPoint,
  end: DimensionMarkDomain.IPoint
): number {
  const A = point.x - start.x;
  const B = point.y - start.y;
  const C = end.x - start.x;
  const D = end.y - start.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = start.x;
    yy = start.y;
  } else if (param > 1) {
    xx = end.x;
    yy = end.y;
  } else {
    xx = start.x + param * C;
    yy = start.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function isPointNearArc(
  point: DimensionMarkDomain.IPoint,
  center: DimensionMarkDomain.IPoint,
  radius: number,
  threshold: number
): boolean {
  const dist = distance(point, center);
  return Math.abs(dist - radius) <= threshold;
}

function distance(p1: DimensionMarkDomain.IPoint, p2: DimensionMarkDomain.IPoint): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

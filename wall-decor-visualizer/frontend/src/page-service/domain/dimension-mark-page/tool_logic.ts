// Tool-specific drawing logic
import * as DimensionMarkDomain from '@data-service/domain/dimension-mark/index.js';

// Polygon Tool
export interface IPolygonDrawingState {
  vertices: DimensionMarkDomain.IPoint[];
}

export function startPolygonDrawing(startPoint: DimensionMarkDomain.IPoint): IPolygonDrawingState {
  return {
    vertices: [startPoint]
  };
}

export function addPolygonVertex(
  state: IPolygonDrawingState,
  point: DimensionMarkDomain.IPoint
): IPolygonDrawingState {
  return {
    vertices: [...state.vertices, point]
  };
}

export function closePolygon(state: IPolygonDrawingState): DimensionMarkDomain.IPolygon {
  const vertices = state.vertices;
  const area = calculatePolygonArea(vertices);

  return {
    vertices,
    area,
    color: '#FF0000',
    fillColor: 'rgba(255, 0, 0, 0.2)'
  };
}

export function calculatePolygonArea(vertices: DimensionMarkDomain.IPoint[]): number {
  if (vertices.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area / 2);
}

// Dimension Tool
export interface IDimensionDrawingState {
  startPoint: DimensionMarkDomain.IPoint;
}

export function startDimensionDrawing(startPoint: DimensionMarkDomain.IPoint): IDimensionDrawingState {
  return { startPoint };
}

export function completeDimensionLine(
  state: IDimensionDrawingState,
  endPoint: DimensionMarkDomain.IPoint
): DimensionMarkDomain.IDimension {
  return {
    startPoint: state.startPoint,
    endPoint,
    color: '#000000',
    arrowHeadSize: 12
  };
}

// Freehand Tool
export interface IFreehandDrawingState {
  points: DimensionMarkDomain.IPoint[];
}

export function startFreehandDrawing(startPoint: DimensionMarkDomain.IPoint): IFreehandDrawingState {
  return {
    points: [startPoint]
  };
}

export function addFreehandPoint(
  state: IFreehandDrawingState,
  point: DimensionMarkDomain.IPoint
): IFreehandDrawingState {
  return {
    points: [...state.points, point]
  };
}

export function completeFreehandLine(state: IFreehandDrawingState): DimensionMarkDomain.IFreehand {
  return {
    points: state.points,
    color: '#000000',
    strokeWidth: 2
  };
}

// Arch Tool
export interface IArchDrawingState {
  startPoint: DimensionMarkDomain.IPoint;
  archType: '180' | '90';
}

export function startArchDrawing(
  startPoint: DimensionMarkDomain.IPoint,
  archType: '180' | '90'
): IArchDrawingState {
  return {
    startPoint,
    archType
  };
}

export function completeArch(
  state: IArchDrawingState,
  endPoint: DimensionMarkDomain.IPoint
): DimensionMarkDomain.IArch {
  const centerPoint = calculateArchCenter(state.startPoint, endPoint, state.archType);
  const radius = calculateArchRadius(state.startPoint, endPoint, state.archType);

  return {
    type: state.archType,
    circumferencePoints: [state.startPoint, endPoint],
    centerPoint,
    radius,
    color: '#000000'
  };
}

export function calculateArchCenter(
  p1: DimensionMarkDomain.IPoint,
  p2: DimensionMarkDomain.IPoint,
  archType: '180' | '90'
): DimensionMarkDomain.IPoint {
  if (archType === '180') {
    // For 180° arch, center is at midpoint of the line connecting p1 and p2
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  } else {
    // For 90° arch, center is at p1
    return p1;
  }
}

export function calculateArchRadius(
  p1: DimensionMarkDomain.IPoint,
  p2: DimensionMarkDomain.IPoint,
  archType: '180' | '90'
): number {
  if (archType === '180') {
    // For 180° arch, radius is half the distance between p1 and p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy) / 2;
  } else {
    // For 90° arch, radius is the distance from p1 to p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Corner Tools
export function createConcaveCorner(
  point: DimensionMarkDomain.IPoint,
  imageWidth: number
): DimensionMarkDomain.IConcaveCorner {
  return {
    point,
    size: imageWidth * 0.03,
    color: '#0000FF',
    strokeColor: '#000000'
  };
}

export function createConvexCorner(
  point: DimensionMarkDomain.IPoint,
  imageWidth: number
): DimensionMarkDomain.IConvexCorner {
  return {
    point,
    size: imageWidth * 0.03,
    color: '#0000FF',
    strokeColor: '#000000'
  };
}

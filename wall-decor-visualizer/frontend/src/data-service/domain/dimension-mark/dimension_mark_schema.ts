// Type definitions for dimension marking domain
export interface IPoint {
  x: number;
  y: number;
}

export type AnnotationType = 'polygon' | 'dimension' | 'freehand' | 'arch' | 'concave' | 'convex';

export interface IPolygon {
  vertices: IPoint[];
  area: number;
  color: '#FF0000';
  fillColor: 'rgba(255, 0, 0, 0.2)';
}

export interface IDimension {
  startPoint: IPoint;
  endPoint: IPoint;
  color: '#000000';
  arrowHeadSize: number;
}

export interface IFreehand {
  points: IPoint[];
  color: '#000000';
  strokeWidth: number;
}

export interface IArch {
  type: '180' | '90';
  circumferencePoints: [IPoint, IPoint];
  centerPoint: IPoint;
  radius: number;
  color: '#000000';
}

export interface IConcaveCorner {
  point: IPoint;
  size: number;
  color: '#0000FF';
  strokeColor: '#000000';
}

export interface IConvexCorner {
  point: IPoint;
  size: number;
  color: '#0000FF';
  strokeColor: '#000000';
}

export interface IAnnotation {
  id: string;
  type: AnnotationType;
  data: IPolygon | IDimension | IFreehand | IArch | IConcaveCorner | IConvexCorner;
  createdAt: number;
  updatedAt: number;
}

export interface ISaveDimensionsRequest {
  imageUrl: string;
  annotations: IAnnotation[];
  mergedImageBlob: Blob;
}

export interface ISkipDimensionsRequest {
  imageUrl: string;
}

export interface ISaveDimensionsResponse {
  success: boolean;
  message: string;
  nextStep: string;
}

export interface ISkipDimensionsResponse {
  success: boolean;
  message: string;
  nextStep: string;
}

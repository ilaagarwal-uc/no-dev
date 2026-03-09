// Type definitions for model generation domain

export interface IGenerateModelRequest {
  userId: string;
  imageId: string;
  dimensionData: IDimensionData;
  imageUrl: string;
}

export interface IGenerateModelResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface IDimensionData {
  elements: IElement[];
}

export interface IElement {
  id: string;
  category: ElementCategory;
  type: ElementType;
  origin: IPoint3D;
  dimensions: IDimensions;
  hostId?: string;
  side?: Side;
  direction?: Direction;
  archShape?: ArchShape;
  orientation?: Orientation;
  radius?: number;
}

export type ElementCategory = 'STRUCTURE' | 'ELECTRICAL';

export type ElementType = 
  | 'BEAM'
  | 'COLUMN'
  | 'DOOR_RECT'
  | 'DOOR_ARCH'
  | 'ARCH_OPENING'
  | 'MAIN_WALL'
  | 'RETURN_WALL'
  | 'WINDOW'
  | 'SWITCH_BOARD'
  | 'AC'
  | 'NICHE'
  | 'CUTOUT';

export type Side = 'LEFT' | 'RIGHT';
export type Direction = 'INWARD' | 'OUTWARD';
export type ArchShape = 'SEMI' | 'QUARTER';
export type Orientation = 'TL' | 'TR' | 'BL' | 'BR';

export interface IPoint3D {
  x: number;
  y: number;
  z: number;
}

export interface IDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface IJobStatus {
  jobId: string;
  userId: string;
  status: JobStatusType;
  progress: number;
  stage: string;
  modelId?: string;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export type JobStatusType = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface IModelMetadata {
  modelId: string;
  userId: string;
  jobId: string;
  gcpPath: string;
  fileSize: number;
  vertexCount?: number;
  faceCount?: number;
  createdAt: Date;
}

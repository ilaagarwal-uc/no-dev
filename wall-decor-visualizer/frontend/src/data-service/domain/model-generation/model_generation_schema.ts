// Type definitions for frontend model generation

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
  category: string;
  type: string;
  origin: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  hostId?: string;
  side?: string;
  direction?: string;
  archShape?: string;
  orientation?: string;
  radius?: number;
}

export interface IJobStatusResponse {
  success: boolean;
  job: IJobStatus;
}

export interface IJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  stage: string;
  modelId?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface IModelResponse {
  success: boolean;
  model: IModel;
}

export interface IModel {
  modelId: string;
  signedUrl: string;
  expiresAt: string;
  metadata: IModelMetadata;
}

export interface IModelMetadata {
  modelId: string;
  userId: string;
  jobId: string;
  fileSize: number;
  vertexCount?: number;
  faceCount?: number;
  createdAt: string;
}

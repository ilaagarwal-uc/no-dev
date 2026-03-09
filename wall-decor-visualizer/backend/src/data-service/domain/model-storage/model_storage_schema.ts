// Type definitions for model storage

export interface IUploadModelRequest {
  userId: string;
  jobId: string;
  modelFile: Buffer;
  fileName: string;
}

export interface IUploadModelResponse {
  modelId: string;
  gcpPath: string;
  fileSize: number;
  signedUrl: string;
}

export interface IGetModelRequest {
  modelId: string;
  userId: string;
}

export interface IGetModelResponse {
  modelId: string;
  signedUrl: string;
  expiresAt: Date;
  metadata: IModelMetadata;
}

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

export interface IBlenderJob {
  id: string;
  userId: string;
  imageId: string;
  script: string;
  status: BlenderJobStatus;
  outputUrl: string;
  createdAt: Date;
  completedAt: Date;
  error: string;
}

export interface IBlenderOutput {
  modelUrl: string;
  textureUrl: string;
  metadataUrl: string;
}

export type BlenderJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

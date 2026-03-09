// Type definitions for job queue

export interface IJob {
  jobId: string;
  userId: string;
  imageId: string;
  dimensionData: any;
  imageUrl: string;
  status: JobStatus;
  progress: number;
  stage: string;
  modelId?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface IJobUpdate {
  status?: JobStatus;
  progress?: number;
  stage?: string;
  modelId?: string;
  error?: string;
}

export interface IQueueStats {
  totalJobs: number;
  queuedJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
}

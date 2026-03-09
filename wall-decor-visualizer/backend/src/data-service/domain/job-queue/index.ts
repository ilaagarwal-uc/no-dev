// Job queue management logic
import * as JobQueueSchema from './job_queue_schema.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory job queue (replace with Redis/database in production)
const jobQueue: JobQueueSchema.IJob[] = [];
const MAX_CONCURRENT_JOBS = 3;

export async function queueJob(
  userId: string,
  imageId: string,
  dimensionData: any,
  imageUrl: string
): Promise<string> {
  const jobId = uuidv4();
  
  const job: JobQueueSchema.IJob = {
    jobId,
    userId,
    imageId,
    dimensionData,
    imageUrl,
    status: 'queued',
    progress: 0,
    stage: 'Queued',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date()
  };
  
  jobQueue.push(job);
  
  // Start processing if capacity available
  processNextJob();
  
  return jobId;
}

export async function getJobStatus(jobId: string): Promise<JobQueueSchema.IJob | null> {
  const job = jobQueue.find(j => j.jobId === jobId);
  return job || null;
}

export async function updateJobStatus(
  jobId: string,
  update: JobQueueSchema.IJobUpdate
): Promise<void> {
  const job = jobQueue.find(j => j.jobId === jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  if (update.status) job.status = update.status;
  if (update.progress !== undefined) job.progress = update.progress;
  if (update.stage) job.stage = update.stage;
  if (update.modelId) job.modelId = update.modelId;
  if (update.error) job.error = update.error;
  
  if (update.status === 'processing' && !job.startedAt) {
    job.startedAt = new Date();
  }
  if (update.status === 'completed') {
    job.completedAt = new Date();
  }
  if (update.status === 'failed') {
    job.failedAt = new Date();
  }
}

export async function cancelJob(jobId: string): Promise<void> {
  const job = jobQueue.find(j => j.jobId === jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  if (job.status === 'completed') {
    throw new Error('Cannot cancel completed job');
  }
  
  job.status = 'cancelled';
}

async function processNextJob(): Promise<void> {
  const processingCount = jobQueue.filter(j => j.status === 'processing').length;
  
  if (processingCount >= MAX_CONCURRENT_JOBS) {
    return; // At capacity
  }
  
  const nextJob = jobQueue.find(j => j.status === 'queued');
  if (!nextJob) {
    return; // No jobs to process
  }
  
  // Process job (implementation in application layer)
  await updateJobStatus(nextJob.jobId, { status: 'processing', stage: 'Starting...' });
}

export function getQueueStats(): JobQueueSchema.IQueueStats {
  return {
    totalJobs: jobQueue.length,
    queuedJobs: jobQueue.filter(j => j.status === 'queued').length,
    processingJobs: jobQueue.filter(j => j.status === 'processing').length,
    completedJobs: jobQueue.filter(j => j.status === 'completed').length,
    failedJobs: jobQueue.filter(j => j.status === 'failed').length
  };
}

export type {
  IJob,
  JobStatus,
  IJobUpdate,
  IQueueStats
} from './job_queue_schema.js';

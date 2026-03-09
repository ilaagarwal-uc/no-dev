// API endpoint for getting job status
import { Request, Response } from 'express';
import * as JobQueueDomain from '../../domain/job-queue/index.js';

export async function getJobStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    
    const job = await JobQueueDomain.getJobStatus(jobId);
    
    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      job: {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        stage: job.stage,
        modelId: job.modelId,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

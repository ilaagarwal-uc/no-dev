// API endpoint for cancelling job
import { Request, Response } from 'express';
import * as JobQueueDomain from '../../domain/job-queue/index.js';

export async function cancelJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const { jobId } = req.params;
    
    await JobQueueDomain.cancelJob(jobId);
    
    res.status(200).json({
      success: true,
      message: 'Job cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

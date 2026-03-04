import { IBlenderJob } from './blender_schema';

export const validateBlenderScript = (script: string): boolean => {
  return !!script && script.length > 0 && script.includes('import bpy');
};

export const isBlenderJobComplete = (job: IBlenderJob): boolean => {
  return job.status === 'completed' || job.status === 'failed';
};

export const getBlenderJobProgress = (status: string): number => {
  const progressMap: Record<string, number> = {
    queued: 0,
    processing: 50,
    completed: 100,
    failed: 0
  };
  return progressMap[status] || 0;
};

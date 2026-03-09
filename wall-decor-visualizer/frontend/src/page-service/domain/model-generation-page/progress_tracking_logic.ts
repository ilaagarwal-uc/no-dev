// Progress tracking logic
import { IStageStatus } from './interface.js';

export const GENERATION_STAGES = [
  {
    id: 1,
    text: 'Validating dimension data',
    progressRange: [0, 10] as [number, number],
    icon: 'check-circle'
  },
  {
    id: 2,
    text: 'Generating Blender script with Gemini AI',
    progressRange: [10, 30] as [number, number],
    icon: 'code'
  },
  {
    id: 3,
    text: 'Executing Blender script',
    progressRange: [30, 60] as [number, number],
    icon: 'cube'
  },
  {
    id: 4,
    text: 'Exporting glTF model',
    progressRange: [60, 80] as [number, number],
    icon: 'download'
  },
  {
    id: 5,
    text: 'Uploading to cloud storage',
    progressRange: [80, 100] as [number, number],
    icon: 'cloud-upload'
  }
] as const;

export function calculateStageStatus(
  currentStage: string,
  progress: number
): IStageStatus[] {
  return GENERATION_STAGES.map(stage => {
    const [start, end] = stage.progressRange;
    
    let status: 'pending' | 'active' | 'completed';
    if (progress >= end) {
      status = 'completed';
    } else if (progress >= start) {
      status = 'active';
    } else {
      status = 'pending';
    }
    
    return {
      id: stage.id,
      text: stage.text,
      status,
      icon: stage.icon,
      progressRange: stage.progressRange
    };
  });
}

export function getStageIcon(status: 'pending' | 'active' | 'completed'): string {
  switch (status) {
    case 'completed':
      return '✓';
    case 'active':
      return '⟳';
    case 'pending':
      return '○';
  }
}

export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

// Job status polling logic
import { IJobStatus } from './interface.js';

export const POLLING_INTERVAL = 2000; // 2 seconds
export const MAX_POLLING_DURATION = 300000; // 5 minutes

export function startPolling(
  jobId: string,
  onUpdate: (status: IJobStatus) => void,
  interval: number = POLLING_INTERVAL
): number {
  const intervalId = window.setInterval(async () => {
    // Polling implementation will be in the component
  }, interval);
  
  return intervalId;
}

export function stopPolling(intervalId: number): void {
  window.clearInterval(intervalId);
}

export function shouldContinuePolling(status: IJobStatus): boolean {
  return status.status === 'queued' || status.status === 'processing';
}

export function getPollingInterval(retryCount: number): number {
  // Exponential backoff: 2s, 4s, 8s
  return POLLING_INTERVAL * Math.pow(2, retryCount);
}

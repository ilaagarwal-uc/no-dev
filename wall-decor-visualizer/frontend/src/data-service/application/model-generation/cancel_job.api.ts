// API call for cancelling job
import { CancelJobError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function cancelJobApi(jobId: string): Promise<{ success: boolean }> {
  const apiName = `/api/model/job/${jobId}/cancel`;
  const method = 'POST';
  const startTime = logAPICall({ apiName, method });
  
  try {
    const response = await fetch(`${API_BASE_URL}${apiName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new CancelJobError(`Cancel job failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    return data;
  } catch (error) {
    logAPIError({ apiName, method, error });
    throw new CancelJobError(
      `Failed to cancel job: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}

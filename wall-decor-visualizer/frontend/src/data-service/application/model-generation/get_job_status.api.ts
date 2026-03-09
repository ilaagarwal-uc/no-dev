// API call for getting job status
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import { JobStatusError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function getJobStatusApi(
  jobId: string
): Promise<ModelGenerationDomain.IJobStatusResponse> {
  const apiName = `/api/model/job/${jobId}`;
  const method = 'GET';
  const startTime = logAPICall({ apiName, method });
  
  try {
    const response = await fetch(`${API_BASE_URL}${apiName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new JobStatusError(`Get job status failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    return data as ModelGenerationDomain.IJobStatusResponse;
  } catch (error) {
    logAPIError({ apiName, method, error });
    if (error instanceof JobStatusError) {
      throw error;
    }
    throw new JobStatusError(
      `Failed to get job status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}

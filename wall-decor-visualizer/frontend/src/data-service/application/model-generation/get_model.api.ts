// API call for getting model
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import { GetModelError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function getModelApi(
  modelId: string
): Promise<ModelGenerationDomain.IModelResponse> {
  const apiName = `/api/model/${modelId}`;
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
      throw new GetModelError(`Get model failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    return data as ModelGenerationDomain.IModelResponse;
  } catch (error) {
    logAPIError({ apiName, method, error });
    throw new GetModelError(
      `Failed to get model: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}

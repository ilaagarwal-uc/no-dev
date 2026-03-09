// API call for generating 3D model
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import { GenerateModelError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function generateModelApi(
  request: ModelGenerationDomain.IGenerateModelRequest
): Promise<ModelGenerationDomain.IGenerateModelResponse> {
  const apiName = '/api/model/generate';
  const method = 'POST';
  const startTime = logAPICall({ apiName, method, params: request });
  
  try {
    // Validate request
    if (!ModelGenerationDomain.validateGenerateRequest(request)) {
      throw new GenerateModelError('Invalid generate request');
    }
    
    const response = await fetch(`${API_BASE_URL}${apiName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new GenerateModelError(`Generate failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    return data as ModelGenerationDomain.IGenerateModelResponse;
  } catch (error) {
    logAPIError({ apiName, method, error });
    if (error instanceof GenerateModelError) {
      throw error;
    }
    throw new GenerateModelError(
      `Failed to generate model: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  // Get auth token from storage
  return localStorage.getItem('authToken') || '';
}

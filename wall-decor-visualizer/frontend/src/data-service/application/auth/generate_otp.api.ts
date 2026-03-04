import axios from 'axios';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface IGenerateOTPRequest {
  phoneNumber: string;
}

export interface IGenerateOTPResponse {
  success: boolean;
  message: string;
  retryAfter?: number;
}

export async function generateOTP(phoneNumber: string): Promise<IGenerateOTPResponse> {
  const apiName = '/api/auth/generate-otp';
  const method = 'POST';
  const startTime = logAPICall({ apiName, method, params: { phoneNumber } });
  
  try {
    const response = await axios.post<IGenerateOTPResponse>(
      `${API_BASE_URL}${apiName}`,
      { phoneNumber }
    );
    
    logAPIResponse({
      apiName,
      method,
      status: response.status,
      duration: Date.now() - startTime,
      response: response.data
    });
    
    return response.data;
  } catch (error: any) {
    logAPIError({ apiName, method, error });
    
    if (error.response) {
      logAPIResponse({
        apiName,
        method,
        status: error.response.status,
        duration: Date.now() - startTime,
        response: error.response.data,
        error: true
      });
      return error.response.data;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

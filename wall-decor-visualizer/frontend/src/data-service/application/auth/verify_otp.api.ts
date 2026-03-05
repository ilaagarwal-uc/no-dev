import axios from 'axios';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface IVerifyOTPRequest {
  phoneNumber: string;
  otp: string;
}

export interface IVerifyOTPResponse {
  success: boolean;
  token?: string;
  userId?: string;
  error?: {
    message: string;
    code: string;
    remainingAttempts?: number;
    lockedUntil?: number;
  };
}

export async function verifyOTP(
  phoneNumber: string,
  otp: string
): Promise<IVerifyOTPResponse> {
  const apiName = '/api/auth/verify-otp';
  const method = 'POST';
  const startTime = logAPICall({ apiName, method, params: { phoneNumber, otp: '****' } });
  
  try {
    const response = await axios.post<IVerifyOTPResponse>(
      `${API_BASE_URL}${apiName}`,
      { phoneNumber, otp }
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

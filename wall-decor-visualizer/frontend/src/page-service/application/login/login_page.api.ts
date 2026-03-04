import {
  generateOTP as generateOTPApi,
  verifyOTP as verifyOTPApi
} from '../../../data-service/application/auth';

export async function sendOTP(phoneNumber: string): Promise<void> {
  const response = await generateOTPApi(phoneNumber);
  if (!response.success) {
    throw new Error(response.message);
  }
}

export async function verifyOTPAndLogin(
  phoneNumber: string,
  otp: string
): Promise<{ token: string; userId: string }> {
  const response = await verifyOTPApi(phoneNumber, otp);
  
  if (!response.success || !response.token || !response.userId) {
    throw new Error(response.error?.message || 'Verification failed');
  }
  
  return { token: response.token, userId: response.userId };
}

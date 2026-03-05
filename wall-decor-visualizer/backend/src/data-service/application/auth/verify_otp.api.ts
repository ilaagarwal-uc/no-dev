import { Request, Response } from 'express';
import * as AuthDomain from '../../domain/auth/index.js';

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

export async function verifyOTPHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { phoneNumber, otp } = req.body as IVerifyOTPRequest;
    
    if (!AuthDomain.validatePhoneNumber(phoneNumber)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid phone number format. Must be 10 digits.',
          code: 'INVALID_PHONE_NUMBER'
        }
      });
      return;
    }
    
    if (!AuthDomain.validateOTP(otp)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid OTP format. Must be 4 digits.',
          code: 'INVALID_OTP_FORMAT'
        }
      });
      return;
    }
    
    const sanitizedPhone = AuthDomain.sanitizePhoneNumber(phoneNumber);
    const sanitizedOTP = AuthDomain.sanitizeOTP(otp);
    
    const result = await AuthDomain.verifyOTP(sanitizedPhone, sanitizedOTP);
    
    if (!result.success) {
      const statusCode = 
        result.error!.code === 'INVALID_PHONE_NUMBER' || result.error!.code === 'INVALID_OTP_FORMAT' || result.error!.code === 'OTP_USED' ? 400 :
        result.error!.code === 'INCORRECT_OTP' ? 401 :
        result.error!.code === 'OTP_EXPIRED' ? 404 :
        403;
      
      res.status(statusCode).json(result);
      return;
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to verify OTP. Please try again.',
        code: 'SERVER_ERROR'
      }
    });
  }
}

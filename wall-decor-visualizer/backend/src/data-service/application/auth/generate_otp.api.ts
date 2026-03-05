import { Request, Response } from 'express';
import * as AuthDomain from '../../domain/auth/index.js';

export interface IGenerateOTPRequest {
  phoneNumber: string;
  ipAddress?: string;
}

export interface IGenerateOTPResponse {
  success: boolean;
  message: string;
  retryAfter?: number;
}

const PHONE_RATE_LIMIT = 3;
const PHONE_RATE_WINDOW = 600;
const IP_RATE_LIMIT = 10;
const IP_RATE_WINDOW = 3600;

export async function generateOTPHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { phoneNumber, ipAddress } = req.body as IGenerateOTPRequest;
    
    if (!AuthDomain.validatePhoneNumber(phoneNumber)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Must be 10 digits.'
      });
      return;
    }
    
    const sanitizedPhone = AuthDomain.sanitizePhoneNumber(phoneNumber);
    
    const phoneRateLimit = await AuthDomain.checkRateLimit(
      `phone:${sanitizedPhone}`,
      PHONE_RATE_LIMIT,
      PHONE_RATE_WINDOW
    );
    
    if (!phoneRateLimit.allowed) {
      res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.',
        retryAfter: phoneRateLimit.retryAfter
      });
      return;
    }
    
    if (ipAddress) {
      const ipRateLimit = await AuthDomain.checkRateLimit(
        `ip:${ipAddress}`,
        IP_RATE_LIMIT,
        IP_RATE_WINDOW
      );
      
      if (!ipRateLimit.allowed) {
        res.status(429).json({
          success: false,
          message: 'Too many OTP requests from this IP. Please try again later.',
          retryAfter: ipRateLimit.retryAfter
        });
        return;
      }
    }
    
    await AuthDomain.createOrUpdateOTP(sanitizedPhone);
    
    res.status(200).json({
      success: true,
      message: 'OTP generated successfully'
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OTP. Please try again.'
    });
  }
}

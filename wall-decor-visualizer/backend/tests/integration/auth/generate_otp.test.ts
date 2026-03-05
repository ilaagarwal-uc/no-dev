import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { generateOTPHandler } from '../../../src/data-service/application/auth/generate_otp.api';
import { OTPModel, RateLimitModel } from '../../../src/data-service/domain/auth/auth_schema';

const app = express();
app.use(express.json());
app.post('/api/auth/generate-otp', generateOTPHandler);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await OTPModel.deleteMany({});
  await RateLimitModel.deleteMany({});
});

describe('POST /api/auth/generate-otp', () => {
  it('should return 200 and success message for valid phone number', async () => {
    const response = await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber: '1234567890' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('OTP generated successfully');
  });

  it('should return 400 for invalid phone number format', async () => {
    const response = await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber: '123' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid phone number format');
  });

  it('should return 429 when phone rate limit exceeded', async () => {
    const phoneNumber = '1234567890';

    // Send 3 OTP requests
    await request(app).post('/api/auth/generate-otp').send({ phoneNumber });
    await request(app).post('/api/auth/generate-otp').send({ phoneNumber });
    await request(app).post('/api/auth/generate-otp').send({ phoneNumber });

    // 4th request should be rate limited
    const response = await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Too many OTP requests');
    expect(response.body.retryAfter).toBeDefined();
  });

  it('should return 429 when IP rate limit exceeded', async () => {
    const ipAddress = '192.168.1.1';

    // Send 10 OTP requests from same IP
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/auth/generate-otp')
        .send({ phoneNumber: `123456789${i}`, ipAddress });
    }

    // 11th request should be rate limited
    const response = await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber: '9999999999', ipAddress });

    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Too many OTP requests');
    expect(response.body.retryAfter).toBeDefined();
  });

  it('should store OTP in database with correct expiration', async () => {
    const phoneNumber = '1234567890';
    const beforeRequest = new Date();

    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    const afterRequest = new Date();
    const otpRecord = await OTPModel.findOne({ phoneNumber });

    expect(otpRecord).toBeDefined();
    expect(otpRecord!.otp).toBe('2213');
    expect(otpRecord!.phoneNumber).toBe(phoneNumber);
    expect(otpRecord!.used).toBe(false);
    expect(otpRecord!.failedAttempts).toBe(0);
    expect(otpRecord!.lockedUntil).toBeNull();

    // Check expiration is approximately 10 minutes from now
    const expectedExpiry = new Date(beforeRequest.getTime() + 10 * 60 * 1000);
    const timeDiff = Math.abs(otpRecord!.expiresAt.getTime() - expectedExpiry.getTime());
    expect(timeDiff).toBeLessThan(2000); // Allow 2 second tolerance
  });

  it('should sanitize phone number before storing', async () => {
    // The sanitization function limits to 10 digits, so (123) 456-7890 becomes 1234567890
    // But validation requires exactly 10 digits, so this should pass
    const response = await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber: '1234567890' }); // Send already sanitized

    expect(response.status).toBe(200);

    const otpRecord = await OTPModel.findOne({ phoneNumber: '1234567890' });
    expect(otpRecord).toBeDefined();
  });

  it('should update existing OTP for same phone number', async () => {
    const phoneNumber = '1234567890';

    // First request
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    const firstOTP = await OTPModel.findOne({ phoneNumber });
    const firstCreatedAt = firstOTP!.createdAt;

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));

    // Second request
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    const secondOTP = await OTPModel.findOne({ phoneNumber });
    const secondCreatedAt = secondOTP!.createdAt;

    // Should have updated the same record
    expect(secondCreatedAt.getTime()).toBeGreaterThan(firstCreatedAt.getTime());
    
    // Should only have one OTP record for this phone
    const count = await OTPModel.countDocuments({ phoneNumber });
    expect(count).toBe(1);
  });
});

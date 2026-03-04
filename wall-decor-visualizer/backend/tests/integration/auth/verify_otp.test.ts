import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { generateOTPHandler } from '../../../src/data-service/application/auth/generate_otp.api';
import { verifyOTPHandler } from '../../../src/data-service/application/auth/verify_otp.api';
import { OTPModel, UserModel, RateLimitModel } from '../../../src/data-service/domain/auth/auth_schema';

const app = express();
app.use(express.json());
app.post('/api/auth/generate-otp', generateOTPHandler);
app.post('/api/auth/verify-otp', verifyOTPHandler);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test-secret-for-integration-tests';
  process.env.JWT_EXPIRY = '3600';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await OTPModel.deleteMany({});
  await UserModel.deleteMany({});
  await RateLimitModel.deleteMany({});
});

describe('POST /api/auth/verify-otp', () => {
  it('should return 200 with token for valid OTP', async () => {
    const phoneNumber = '1234567890';
    
    // Generate OTP first
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    // Verify OTP
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '2213' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.userId).toBeDefined();
  });

  it('should return 400 for invalid phone number format', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber: '123', otp: '2213' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_PHONE_NUMBER');
  });

  it('should return 400 for invalid OTP format', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber: '1234567890', otp: '12' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_OTP_FORMAT');
  });

  it('should return 401 for incorrect OTP', async () => {
    const phoneNumber = '1234567890';
    
    // Generate OTP first
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    // Verify with wrong OTP
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '1111' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INCORRECT_OTP');
    expect(response.body.error.remainingAttempts).toBe(4);
  });

  it('should return 404 for expired OTP', async () => {
    const phoneNumber = '1234567890';
    
    // Create expired OTP manually
    await OTPModel.create({
      otp: '2213',
      phoneNumber,
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      createdAt: new Date(Date.now() - 11 * 60 * 1000), // Created 11 minutes ago
      used: false,
      failedAttempts: 0,
      lockedUntil: null
    });

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '2213' });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('OTP_EXPIRED');
  });

  it('should return 400 for already used OTP', async () => {
    const phoneNumber = '1234567890';
    
    // Generate and verify OTP once
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });
    
    await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '2213' });

    // Try to use same OTP again
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '2213' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('OTP_USED');
  });

  it('should return 403 for locked OTP (3 failed attempts)', async () => {
    const phoneNumber = '1234567890';
    
    // Generate OTP
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    // Wait for DB write to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fail 3 times
    await request(app).post('/api/auth/verify-otp').send({ phoneNumber, otp: '1111' });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    await request(app).post('/api/auth/verify-otp').send({ phoneNumber, otp: '1111' });
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const thirdAttempt = await request(app).post('/api/auth/verify-otp').send({ phoneNumber, otp: '1111' });

    // 3rd attempt should return lock message
    expect(thirdAttempt.status).toBe(403);
    expect(thirdAttempt.body.success).toBe(false);
    expect(thirdAttempt.body.error.code).toBe('OTP_LOCKED');
    expect(thirdAttempt.body.error.lockedUntil).toBeDefined();
    expect(thirdAttempt.body.error.remainingAttempts).toBe(0);
  });

  it('should return 403 for permanently locked OTP (5 failed attempts)', async () => {
    const phoneNumber = '1234567890';
    
    // Generate OTP
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    // Wait for DB write to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fail 5 times with delays between each
    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/auth/verify-otp').send({ phoneNumber, otp: '1111' });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // 5th attempt should show permanent invalidation
    const fifthAttempt = await request(app).post('/api/auth/verify-otp').send({ phoneNumber, otp: '1111' });

    expect(fifthAttempt.status).toBe(403);
    expect(fifthAttempt.body.success).toBe(false);
    expect(fifthAttempt.body.error.code).toBe('OTP_PERMANENTLY_INVALIDATED');
  });

  it('should increment failedAttempts on incorrect OTP', async () => {
    const phoneNumber = '1234567890';
    
    // Generate OTP
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    // Wait for DB write
    await new Promise(resolve => setTimeout(resolve, 50));

    // Get initial state
    let otpRecord = await OTPModel.findOne({ phoneNumber });
    expect(otpRecord).toBeDefined();
    expect(otpRecord!.failedAttempts).toBe(0);

    // Verify with wrong OTP
    await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '1111' });

    // Wait for DB write
    await new Promise(resolve => setTimeout(resolve, 50));

    otpRecord = await OTPModel.findOne({ phoneNumber });
    expect(otpRecord).toBeDefined();
    expect(otpRecord!.failedAttempts).toBe(1);
  });

  it('should set 1-minute lock after 3rd failed attempt', async () => {
    const phoneNumber = '1234567890';
    
    // Generate OTP
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });

    // Wait for DB write
    await new Promise(resolve => setTimeout(resolve, 50));

    // Fail 2 times
    await request(app).post('/api/auth/verify-otp').send({ phoneNumber, otp: '1111' });
    await request(app).post('/api/auth/verify-otp').send({ phoneNumber, otp: '1111' });
    
    // 3rd attempt
    const thirdAttempt = await request(app).post('/api/auth/verify-otp').send({ phoneNumber, otp: '1111' });

    expect(thirdAttempt.status).toBe(403);
    expect(thirdAttempt.body.error.code).toBe('OTP_LOCKED');

    // Wait for DB write
    await new Promise(resolve => setTimeout(resolve, 50));

    const otpRecord = await OTPModel.findOne({ phoneNumber });
    expect(otpRecord).toBeDefined();
    expect(otpRecord!.failedAttempts).toBe(3);
    expect(otpRecord!.lockedUntil).toBeDefined();
    
    // Check lock is approximately 1 minute from now
    const expectedLockUntil = new Date(Date.now() + 60 * 1000);
    const timeDiff = Math.abs(otpRecord!.lockedUntil!.getTime() - expectedLockUntil.getTime());
    expect(timeDiff).toBeLessThan(2000); // Allow 2 second tolerance
  });

  it('should mark OTP as used after successful verification', async () => {
    const phoneNumber = '1234567890';
    
    // Generate OTP
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });
    
    // Wait for DB write
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Get initial state
    let otpRecord = await OTPModel.findOne({ phoneNumber });
    expect(otpRecord).toBeDefined();
    expect(otpRecord!.used).toBe(false);
    
    // Verify with correct OTP
    await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '2213' });

    // Wait for DB write
    await new Promise(resolve => setTimeout(resolve, 50));

    otpRecord = await OTPModel.findOne({ phoneNumber });
    expect(otpRecord).toBeDefined();
    expect(otpRecord!.used).toBe(true);
  });

  it('should create user if not exists', async () => {
    const phoneNumber = '1234567890';
    
    // Verify no user exists
    let user = await UserModel.findOne({ phoneNumber });
    expect(user).toBeNull();

    // Generate and verify OTP
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });
    
    // Wait for DB write
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '2213' });

    expect(response.status).toBe(200);

    // Wait for DB write
    await new Promise(resolve => setTimeout(resolve, 50));

    // User should now exist
    user = await UserModel.findOne({ phoneNumber });
    expect(user).toBeDefined();
    expect(user).not.toBeNull();
    expect(user!.phoneNumber).toBe(phoneNumber);
  });

  it('should update user if already exists', async () => {
    const phoneNumber = '1234567890';
    
    // Create user
    const existingUser = await UserModel.create({
      phoneNumber,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    const oldUpdatedAt = existingUser.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Generate and verify OTP
    await request(app)
      .post('/api/auth/generate-otp')
      .send({ phoneNumber });
    
    await request(app)
      .post('/api/auth/verify-otp')
      .send({ phoneNumber, otp: '2213' });

    // User updatedAt should be updated
    const user = await UserModel.findOne({ phoneNumber });
    expect(user!.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
  });
});

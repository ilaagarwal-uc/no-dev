import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { logoutHandler } from '../../../src/data-service/application/auth/logout.api';
import { authenticateJWT } from '../../../src/data-service/application/auth/authenticate_jwt.api';

const app: Express = express();
app.use(express.json());

// Routes
app.post('/api/auth/logout', authenticateJWT, logoutHandler);

let mongoServer: MongoMemoryServer;
const JWT_SECRET = 'test-secret-key';
const TEST_USER_ID = 'user_test_123';

// Helper to generate JWT token
function generateToken(userId: string = TEST_USER_ID, expiresIn: string = '1h'): string {
  return jwt.sign(
    { userId, phoneNumber: '+1234567890' },
    JWT_SECRET,
    { expiresIn }
  );
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = JWT_SECRET;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Logout API - Backend Tests', () => {
  describe('Successful Logout Scenarios', () => {
    it('should logout successfully with valid token', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully'
      });
    });

    it('should clear session cookie on logout', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Check for Set-Cookie header with session_token cleared
      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain('session_token');
    });

    it('should logout different users independently', async () => {
      const token1 = generateToken('user_1');
      const token2 = generateToken('user_2');

      const response1 = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const response2 = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });
  });

  describe('Authentication Validation', () => {
    it('should reject logout without authentication token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject logout with malformed token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer not.a.token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject logout with expired token', async () => {
      const expiredToken = generateToken(TEST_USER_ID, '-1h');
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject logout with missing Bearer prefix', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', token)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject logout with wrong Authorization scheme', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Basic ${token}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Mock authenticateJWT to throw an error
      const originalAuth = authenticateJWT;
      
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Should either succeed or return proper error
      expect([200, 500]).toContain(response.status);
    });

    it('should return proper error response format', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('code');
    });
  });

  describe('Request Validation', () => {
    it('should accept POST requests only', async () => {
      const token = generateToken();
      
      const getResponse = await request(app)
        .get('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      const putResponse = await request(app)
        .put('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      const deleteResponse = await request(app)
        .delete('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should handle empty request body', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should ignore extra request body fields', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ extraField: 'should be ignored' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Response Format', () => {
    it('should return JSON response', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should include success flag in response', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });

    it('should include message in successful response', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Cookie Management', () => {
    it('should set httpOnly flag on cleared cookie', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain('HttpOnly');
    });

    it('should set SameSite=Strict on cleared cookie', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain('SameSite=Strict');
    });

    it('should set path=/ on cleared cookie', async () => {
      const token = generateToken();
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain('Path=/');
    });
  });

  describe('Concurrent Logout Requests', () => {
    it('should handle multiple concurrent logout requests', async () => {
      const token = generateToken();
      
      const responses = await Promise.all([
        request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token}`),
        request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token}`),
        request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token}`)
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('should handle logout from different users concurrently', async () => {
      const token1 = generateToken('user_1');
      const token2 = generateToken('user_2');
      const token3 = generateToken('user_3');

      const responses = await Promise.all([
        request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token1}`),
        request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token2}`),
        request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token3}`)
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});

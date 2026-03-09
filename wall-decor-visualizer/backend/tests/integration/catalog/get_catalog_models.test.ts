import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import { getCatalogModelsHandler } from '../../../src/data-service/application/catalog/index.js';
import { authenticateJWT } from '../../../src/data-service/application/auth/authenticate_jwt.api.js';

const app: Express = express();
app.use(express.json());

// Routes
app.get('/api/catalog/models', authenticateJWT, getCatalogModelsHandler);

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
  process.env.JWT_SECRET = JWT_SECRET;
});

afterAll(async () => {
  vi.restoreAllMocks();
});

describe('Get Catalog Models API - Backend Tests', () => {
  describe('Successful Scenarios', () => {
    it('should return catalog models with valid token', async () => {
      const token = generateToken();

      const response = await request(app)
        .get('/api/catalog/models')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.models).toBeInstanceOf(Array);
      expect(response.body.data.count).toBeGreaterThanOrEqual(0);
    });

    it('should return models with parsed metadata', async () => {
      const token = generateToken();

      const response = await request(app)
        .get('/api/catalog/models')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const models = response.body.data.models;
      
      // Check if any models have metadata
      const modelsWithMetadata = models.filter((m: any) => m.metadata);
      
      if (modelsWithMetadata.length > 0) {
        const model = modelsWithMetadata[0];
        expect(model.metadata.modelId).toBeDefined();
        expect(model.metadata.dimensions).toBeDefined();
        expect(model.metadata.dimensions.width).toBeGreaterThan(0);
        expect(model.metadata.dimensions.height).toBeGreaterThan(0);
        expect(model.metadata.dimensions.depth).toBeGreaterThanOrEqual(0);
      }
    });

    it('should include file information for each model', async () => {
      const token = generateToken();

      const response = await request(app)
        .get('/api/catalog/models')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const models = response.body.data.models;
      
      if (models.length > 0) {
        const model = models[0];
        expect(model.fileName).toBeDefined();
        expect(model.filePath).toBeDefined();
        expect(model.extension).toMatch(/^\.(glb|gltf)$/);
      }
    });
  });

  describe('Authentication Scenarios', () => {
    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/catalog/models')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/catalog/models')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with expired token', async () => {
      const expiredToken = generateToken(TEST_USER_ID, '-1h'); // Expired 1 hour ago

      const response = await request(app)
        .get('/api/catalog/models')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

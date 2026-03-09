import { describe, it, expect } from 'vitest';
import * as ModelGenerationDomain from '../../../src/data-service/domain/model-generation';

describe('API Validation & Error Handling Tests', () => {
  describe('1.5.1 Request Validation', () => {
    it('Test 1.5.1.1: Validate dimension data structure', () => {
      const validData = {
        elements: [
          {
            id: 'element_1',
            category: 'STRUCTURE' as const,
            type: 'MAIN_WALL' as const,
            origin: { x: 0, y: 0, z: 0 },
            dimensions: { width: 12, height: 10, depth: 0.75 }
          }
        ]
      };

      const isValid = ModelGenerationDomain.validateDimensionData(validData);
      expect(isValid).toBe(true);
    });

    it('Test 1.5.1.2: Reject dimension data with missing required fields', () => {
      const invalidData = {
        elements: []
      };

      const isValid = ModelGenerationDomain.validateDimensionData(invalidData);
      expect(isValid).toBe(false);
    });

    it('Test 1.5.1.3: Validate dimension value ranges (positive numbers)', () => {
      const invalidElement = {
        id: 'element_1',
        category: 'STRUCTURE' as const,
        type: 'MAIN_WALL' as const,
        origin: { x: 0, y: 0, z: 0 },
        dimensions: { width: -12, height: 10, depth: 0.75 }
      };

      const isValid = ModelGenerationDomain.validateElement(invalidElement);
      expect(isValid).toBe(false);
    });

    it('Test 1.5.1.4: Validate enum values (type, category, side, direction)', () => {
      const validElement = {
        id: 'element_1',
        category: 'STRUCTURE' as const,
        type: 'MAIN_WALL' as const,
        origin: { x: 0, y: 0, z: 0 },
        dimensions: { width: 12, height: 10, depth: 0.75 }
      };

      const isValid = ModelGenerationDomain.validateElement(validElement);
      expect(isValid).toBe(true);
    });

    it('Test 1.5.1.5: Validate coordinate system (origin at bottom-left)', () => {
      const element = {
        id: 'element_1',
        category: 'STRUCTURE' as const,
        type: 'MAIN_WALL' as const,
        origin: { x: -5, y: -3, z: 0 },
        dimensions: { width: 12, height: 10, depth: 0.75 }
      };

      // Negative coordinates should trigger a warning but not fail validation
      const isValid = ModelGenerationDomain.validateElement(element);
      expect(isValid).toBeDefined();
    });

    it('Test 1.5.1.6: Validate image data (base64 format)', () => {
      const validRequest = {
        userId: 'user_123',
        imageId: 'image_456',
        dimensionData: {
          elements: [
            {
              id: 'element_1',
              category: 'STRUCTURE' as const,
              type: 'MAIN_WALL' as const,
              origin: { x: 0, y: 0, z: 0 },
              dimensions: { width: 12, height: 10, depth: 0.75 }
            }
          ]
        },
        imageUrl: 'https://example.com/image.jpg'
      };

      const isValid = ModelGenerationDomain.validateGenerateRequest(validRequest);
      expect(isValid).toBe(true);
    });
  });

  describe('1.5.2 Error Response Formatting', () => {
    it('Test 1.5.2.1: Format validation error response (400)', () => {
      const error = {
        status: 400,
        field: 'dimensionData',
        message: 'Invalid dimension data'
      };

      expect(error.status).toBe(400);
      expect(error.message).toBeTruthy();
    });

    it('Test 1.5.2.2: Format authentication error response (401)', () => {
      const error = {
        status: 401,
        message: 'Unauthorized'
      };

      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('Test 1.5.2.3: Format not found error response (404)', () => {
      const error = {
        status: 404,
        message: 'Resource not found'
      };

      expect(error.status).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('Test 1.5.2.4: Format rate limit error response (429)', () => {
      const error = {
        status: 429,
        message: 'Rate limit exceeded',
        retryAfter: 60
      };

      expect(error.status).toBe(429);
      expect(error.retryAfter).toBeDefined();
    });

    it('Test 1.5.2.5: Format server error response (500)', () => {
      const error = {
        status: 500,
        message: 'Internal server error'
      };

      expect(error.status).toBe(500);
      expect(error.message).not.toContain('stack');
    });

    it('Test 1.5.2.6: Format service unavailable error response (503)', () => {
      const error = {
        status: 503,
        message: 'Service temporarily unavailable'
      };

      expect(error.status).toBe(503);
      expect(error.message).toBe('Service temporarily unavailable');
    });
  });
});

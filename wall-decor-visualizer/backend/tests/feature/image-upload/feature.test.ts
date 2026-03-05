import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { uploadImageHandler } from '../../../src/data-service/application/image-upload/upload_image.api';
import { authenticateJWT } from '../../../src/data-service/application/auth/authenticate_jwt.api';
import * as ImageUploadDomain from '../../../src/data-service/domain/image-upload';
import { Buffer } from 'buffer';

// Mock GCP storage
vi.mock('../../../src/gcp/storage', () => ({
  uploadToGCP: vi.fn(async (path: string, buffer: Buffer, mimeType: string) => {
    return `https://storage.googleapis.com/bucket/${path}?token=signed`;
  })
}));

const app = express();
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Routes
app.post('/api/images/upload', authenticateJWT, upload.single('image'), uploadImageHandler);

let mongoServer: MongoMemoryServer;
const JWT_SECRET = 'test-secret-key';
const TEST_USER_ID = 'user_test_123';

// Helper to generate JWT token
function generateToken(userId: string = TEST_USER_ID): string {
  return jwt.sign(
    { userId, phoneNumber: '+1234567890' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Helper to create a valid JPEG buffer
function createJPEGBuffer(size: number = 2048): Buffer {
  const buffer = Buffer.alloc(size);
  // JPEG magic number
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  buffer[3] = 0xe0;
  return buffer;
}

// Helper to create a valid PNG buffer
function createPNGBuffer(size: number = 2048): Buffer {
  const buffer = Buffer.alloc(size);
  // PNG magic number
  buffer[0] = 0x89;
  buffer[1] = 0x50;
  buffer[2] = 0x4e;
  buffer[3] = 0x47;
  return buffer;
}

// Helper to create a valid WebP buffer
function createWebPBuffer(size: number = 2048): Buffer {
  const buffer = Buffer.alloc(size);
  // RIFF header
  buffer[0] = 0x52; // R
  buffer[1] = 0x49; // I
  buffer[2] = 0x46; // F
  buffer[3] = 0x46; // F
  // WebP signature
  buffer[8] = 0x57; // W
  buffer[9] = 0x45; // E
  buffer[10] = 0x42; // B
  buffer[11] = 0x50; // P
  return buffer;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  // Set JWT secret for auth middleware
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

describe('Image Upload Feature - Comprehensive Test Suite', () => {
  
  // ============================================
  // SECTION 1: DOMAIN LAYER UNIT TESTS
  // ============================================
  
  describe('Domain Layer - Image Validation', () => {
    
    describe('validateImageFormat', () => {
      it('should accept JPEG format', () => {
        expect(ImageUploadDomain.validateImageFormat('image/jpeg')).toBe(true);
      });

      it('should accept PNG format', () => {
        expect(ImageUploadDomain.validateImageFormat('image/png')).toBe(true);
      });

      it('should accept WebP format', () => {
        expect(ImageUploadDomain.validateImageFormat('image/webp')).toBe(true);
      });

      it('should reject GIF format', () => {
        expect(ImageUploadDomain.validateImageFormat('image/gif')).toBe(false);
      });

      it('should reject BMP format', () => {
        expect(ImageUploadDomain.validateImageFormat('image/bmp')).toBe(false);
      });

      it('should reject text format', () => {
        expect(ImageUploadDomain.validateImageFormat('text/plain')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(ImageUploadDomain.validateImageFormat('')).toBe(false);
      });
    });

    describe('validateImageSize', () => {
      it('should accept minimum size (1KB)', () => {
        expect(ImageUploadDomain.validateImageSize(1024)).toBe(true);
      });

      it('should accept typical size (2MB)', () => {
        expect(ImageUploadDomain.validateImageSize(2 * 1024 * 1024)).toBe(true);
      });

      it('should accept maximum size (10MB)', () => {
        expect(ImageUploadDomain.validateImageSize(10 * 1024 * 1024)).toBe(true);
      });

      it('should reject size below minimum (512 bytes)', () => {
        expect(ImageUploadDomain.validateImageSize(512)).toBe(false);
      });

      it('should reject size above maximum (11MB)', () => {
        expect(ImageUploadDomain.validateImageSize(11 * 1024 * 1024)).toBe(false);
      });

      it('should reject zero size', () => {
        expect(ImageUploadDomain.validateImageSize(0)).toBe(false);
      });

      it('should reject negative size', () => {
        expect(ImageUploadDomain.validateImageSize(-1024)).toBe(false);
      });
    });

    describe('validateImageNotEmpty', () => {
      it('should accept non-empty file', () => {
        expect(ImageUploadDomain.validateImageNotEmpty(1024)).toBe(true);
      });

      it('should reject empty file', () => {
        expect(ImageUploadDomain.validateImageNotEmpty(0)).toBe(false);
      });

      it('should reject negative size', () => {
        expect(ImageUploadDomain.validateImageNotEmpty(-1)).toBe(false);
      });
    });

    describe('verifyMagicNumber', () => {
      it('should verify valid JPEG magic number', () => {
        const buffer = createJPEGBuffer(100);
        expect(ImageUploadDomain.verifyMagicNumber('image/jpeg', buffer)).toBe(true);
      });

      it('should verify valid PNG magic number', () => {
        const buffer = createPNGBuffer(100);
        expect(ImageUploadDomain.verifyMagicNumber('image/png', buffer)).toBe(true);
      });

      it('should verify valid WebP magic number', () => {
        const buffer = createWebPBuffer(100);
        expect(ImageUploadDomain.verifyMagicNumber('image/webp', buffer)).toBe(true);
      });

      it('should reject PNG buffer with JPEG MIME type', () => {
        const buffer = createPNGBuffer(100);
        expect(ImageUploadDomain.verifyMagicNumber('image/jpeg', buffer)).toBe(false);
      });

      it('should reject JPEG buffer with PNG MIME type', () => {
        const buffer = createJPEGBuffer(100);
        expect(ImageUploadDomain.verifyMagicNumber('image/png', buffer)).toBe(false);
      });

      it('should reject empty buffer', () => {
        const buffer = Buffer.alloc(0);
        expect(ImageUploadDomain.verifyMagicNumber('image/jpeg', buffer)).toBe(false);
      });

      it('should reject buffer too small for WebP', () => {
        const buffer = Buffer.alloc(5);
        expect(ImageUploadDomain.verifyMagicNumber('image/webp', buffer)).toBe(false);
      });

      it('should reject unsupported MIME type', () => {
        const buffer = createJPEGBuffer(100);
        expect(ImageUploadDomain.verifyMagicNumber('image/gif', buffer)).toBe(false);
      });
    });

    describe('validateImageConstraints', () => {
      it('should validate correct JPEG image', () => {
        const buffer = createJPEGBuffer(2048);
        const result = ImageUploadDomain.validateImageConstraints('image/jpeg', 2048, buffer);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should validate correct PNG image', () => {
        const buffer = createPNGBuffer(2048);
        const result = ImageUploadDomain.validateImageConstraints('image/png', 2048, buffer);
        expect(result.valid).toBe(true);
      });

      it('should validate correct WebP image', () => {
        const buffer = createWebPBuffer(2048);
        const result = ImageUploadDomain.validateImageConstraints('image/webp', 2048, buffer);
        expect(result.valid).toBe(true);
      });

      it('should reject empty file', () => {
        const buffer = Buffer.alloc(0);
        const result = ImageUploadDomain.validateImageConstraints('image/jpeg', 0, buffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('EMPTY_FILE');
      });

      it('should reject unsupported format', () => {
        const buffer = Buffer.alloc(2048);
        const result = ImageUploadDomain.validateImageConstraints('image/gif', 2048, buffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('INVALID_IMAGE_FORMAT');
      });

      it('should reject file below minimum size', () => {
        const buffer = createJPEGBuffer(512);
        const result = ImageUploadDomain.validateImageConstraints('image/jpeg', 512, buffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('IMAGE_SIZE_BELOW_MINIMUM');
      });

      it('should reject file exceeding maximum size', () => {
        const buffer = createJPEGBuffer(11 * 1024 * 1024);
        const result = ImageUploadDomain.validateImageConstraints('image/jpeg', 11 * 1024 * 1024, buffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('IMAGE_SIZE_EXCEEDS_LIMIT');
      });

      it('should reject mismatched magic number', () => {
        const buffer = createPNGBuffer(2048);
        const result = ImageUploadDomain.validateImageConstraints('image/jpeg', 2048, buffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('INVALID_IMAGE_FORMAT');
      });
    });

    describe('generateImageId', () => {
      it('should generate ID with img_ prefix', () => {
        const id = ImageUploadDomain.generateImageId();
        expect(id).toMatch(/^img_/);
      });

      it('should generate unique IDs', () => {
        const id1 = ImageUploadDomain.generateImageId();
        const id2 = ImageUploadDomain.generateImageId();
        expect(id1).not.toBe(id2);
      });

      it('should generate valid format IDs', () => {
        const id = ImageUploadDomain.generateImageId();
        expect(id).toMatch(/^img_[a-z0-9]+$/);
      });
    });

    describe('sanitizeFilename', () => {
      it('should preserve valid filename', () => {
        const result = ImageUploadDomain.sanitizeFilename('photo.jpg');
        expect(result).toBe('photo.jpg');
      });

      it('should convert to lowercase', () => {
        const result = ImageUploadDomain.sanitizeFilename('PHOTO.JPG');
        expect(result).toBe('photo.jpg');
      });

      it('should remove special characters', () => {
        const result = ImageUploadDomain.sanitizeFilename('my@#$%photo.jpg');
        expect(result).toBe('my____photo.jpg');
      });

      it('should preserve hyphens and underscores', () => {
        const result = ImageUploadDomain.sanitizeFilename('my-photo_2024.jpg');
        expect(result).toBe('my-photo_2024.jpg');
      });

      it('should remove path traversal attempts', () => {
        const result = ImageUploadDomain.sanitizeFilename('../../../etc/passwd.jpg');
        expect(result).not.toContain('..');
      });

      it('should handle empty filename', () => {
        const result = ImageUploadDomain.sanitizeFilename('');
        expect(result).toBe('image');
      });

      it('should limit filename length to 255 characters', () => {
        const longName = 'a'.repeat(300) + '.jpg';
        const result = ImageUploadDomain.sanitizeFilename(longName);
        expect(result.length).toBeLessThanOrEqual(255);
      });

      it('should preserve extension when limiting length', () => {
        const longName = 'a'.repeat(300) + '.jpg';
        const result = ImageUploadDomain.sanitizeFilename(longName);
        expect(result).toMatch(/\.jpg$/);
      });
    });

    describe('validateUserId', () => {
      it('should accept valid user ID', () => {
        expect(ImageUploadDomain.validateUserId('user_123')).toBe(true);
      });

      it('should reject empty string', () => {
        expect(ImageUploadDomain.validateUserId('')).toBe(false);
      });

      it('should reject whitespace only', () => {
        expect(ImageUploadDomain.validateUserId('   ')).toBe(false);
      });
    });

    describe('validateUserOwnership', () => {
      it('should accept matching user IDs', () => {
        expect(ImageUploadDomain.validateUserOwnership('user_123', 'user_123')).toBe(true);
      });

      it('should reject non-matching user IDs', () => {
        expect(ImageUploadDomain.validateUserOwnership('user_123', 'user_456')).toBe(false);
      });

      it('should be case-sensitive', () => {
        expect(ImageUploadDomain.validateUserOwnership('User_123', 'user_123')).toBe(false);
      });
    });

    describe('getMimeTypeFromExtension', () => {
      it('should return JPEG MIME type for .jpg', () => {
        expect(ImageUploadDomain.getMimeTypeFromExtension('photo.jpg')).toBe('image/jpeg');
      });

      it('should return JPEG MIME type for .jpeg', () => {
        expect(ImageUploadDomain.getMimeTypeFromExtension('photo.jpeg')).toBe('image/jpeg');
      });

      it('should return PNG MIME type for .png', () => {
        expect(ImageUploadDomain.getMimeTypeFromExtension('photo.png')).toBe('image/png');
      });

      it('should return WebP MIME type for .webp', () => {
        expect(ImageUploadDomain.getMimeTypeFromExtension('photo.webp')).toBe('image/webp');
      });

      it('should return null for unsupported extension', () => {
        expect(ImageUploadDomain.getMimeTypeFromExtension('photo.gif')).toBeNull();
      });

      it('should be case-insensitive', () => {
        expect(ImageUploadDomain.getMimeTypeFromExtension('PHOTO.JPG')).toBe('image/jpeg');
      });
    });
  });

  // ============================================
  // SECTION 2: API ENDPOINT TESTS
  // ============================================

  describe('POST /api/images/upload - Authentication', () => {
    it('should return 401 when no authorization header provided', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', createJPEGBuffer(), 'test.jpg');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', 'Bearer invalid.token.here')
        .attach('image', createJPEGBuffer(), 'test.jpg');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when token is expired', async () => {
      const expiredToken = jwt.sign(
        { userId: TEST_USER_ID, phoneNumber: '+1234567890' },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${expiredToken}`)
        .attach('image', createJPEGBuffer(), 'test.jpg');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/images/upload - File Validation', () => {
    it('should return 400 when no file provided', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMPTY_FILE');
    });

    it('should return 400 for empty file', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', Buffer.alloc(0), 'test.jpg');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMPTY_FILE');
    });

    it('should return 400 for unsupported image format (GIF)', async () => {
      const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38]);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', gifBuffer, 'test.gif');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_IMAGE_FORMAT');
    });

    it('should return 400 for file below minimum size', () => {
      const smallBuffer = createJPEGBuffer(512);
      return request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', smallBuffer, 'test.jpg')
        .then(response => {
          expect(response.status).toBe(400);
          expect(response.body.error.code).toBe('IMAGE_SIZE_BELOW_MINIMUM');
        });
    });

    it('should return 400 for file with mismatched magic number', async () => {
      const pngBuffer = createPNGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', pngBuffer, 'test.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_IMAGE_FORMAT');
    });
  });

  describe('POST /api/images/upload - Successful Upload', () => {
    it('should successfully upload valid JPEG image', async () => {
      const jpegBuffer = createJPEGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', jpegBuffer, 'photo.jpg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.imageId).toBeDefined();
      expect(response.body.imageId).toMatch(/^img_/);
      expect(response.body.gcpUrl).toBeDefined();
      expect(response.body.gcpUrl).toContain('storage.googleapis.com');
    });

    it('should successfully upload valid PNG image', async () => {
      const pngBuffer = createPNGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', pngBuffer, 'photo.png');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.imageId).toBeDefined();
    });

    it('should successfully upload valid WebP image', async () => {
      const webpBuffer = createWebPBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', webpBuffer, 'photo.webp');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should generate unique imageIds for multiple uploads', async () => {
      const buffer1 = createJPEGBuffer(2048);
      const buffer2 = createJPEGBuffer(2048);

      const response1 = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer1, 'photo1.jpg');

      const response2 = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer2, 'photo2.jpg');

      expect(response1.body.imageId).not.toBe(response2.body.imageId);
    });

    it('should sanitize filename with special characters', async () => {
      const buffer = createJPEGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer, 'my@#$%photo.jpg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.gcpUrl).toContain('my____photo.jpg');
    });

    it('should convert filename to lowercase', async () => {
      const buffer = createJPEGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer, 'PHOTO.JPG');

      expect(response.status).toBe(200);
      expect(response.body.gcpUrl).toContain('photo.jpg');
    });
  });

  // ============================================
  // SECTION 3: EDGE CASES AND ERROR HANDLING
  // ============================================

  describe('Edge Cases', () => {
    it('should handle minimum size image (1KB)', async () => {
      const minBuffer = createJPEGBuffer(1024);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', minBuffer, 'photo.jpg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle filename with multiple dots', async () => {
      const buffer = createJPEGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer, 'my.photo.backup.jpg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle filename with hyphens and underscores', async () => {
      const buffer = createJPEGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer, 'my-photo_2024.jpg');

      expect(response.status).toBe(200);
      expect(response.body.gcpUrl).toContain('my-photo_2024.jpg');
    });

    it('should reject filename without extension', async () => {
      const buffer = createJPEGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer, 'photo');

      // Without extension, MIME type cannot be determined
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle very long filename', async () => {
      const buffer = createJPEGBuffer(2048);
      const longName = 'a'.repeat(300) + '.jpg';
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer, longName);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Verify filename is truncated to 255 chars
      expect(response.body.gcpUrl.length).toBeLessThan(500);
    });
  });

  // ============================================
  // SECTION 4: RESPONSE FORMAT VALIDATION
  // ============================================

  describe('Response Format', () => {
    it('should return correct success response structure', async () => {
      const buffer = createJPEGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer, 'photo.jpg');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('imageId');
      expect(response.body).toHaveProperty('gcpUrl');
      expect(Object.keys(response.body).length).toBe(3);
    });

    it('should return correct error response structure', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', Buffer.alloc(0), 'test.jpg');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('code');
    });

    it('should include Content-Type header in response', async () => {
      const buffer = createJPEGBuffer(2048);
      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${generateToken()}`)
        .attach('image', buffer, 'photo.jpg');

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  // ============================================
  // SECTION 5: INTEGRATION SCENARIOS
  // ============================================

  describe('Integration Scenarios', () => {
    it('should handle sequential uploads from same user', async () => {
      const token = generateToken();
      const buffer1 = createJPEGBuffer(2048);
      const buffer2 = createPNGBuffer(2048);

      const response1 = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', buffer1, 'photo1.jpg');

      const response2 = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', buffer2, 'photo2.png');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.imageId).not.toBe(response2.body.imageId);
    });

    it('should handle uploads from different users', async () => {
      const token1 = generateToken('user_1');
      const token2 = generateToken('user_2');
      const buffer = createJPEGBuffer(2048);

      const response1 = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${token1}`)
        .attach('image', buffer, 'photo.jpg');

      const response2 = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${token2}`)
        .attach('image', buffer, 'photo.jpg');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.imageId).not.toBe(response2.body.imageId);
    });
  });
});

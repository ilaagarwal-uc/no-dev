import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import { generateOTPHandler, verifyOTPHandler, refreshTokenHandler, logoutHandler, authenticateJWT } from './data-service/application/auth/index.js';
import { uploadImageHandler } from './data-service/application/image-upload/index.js';
import { getLoginPageHandler } from './page-service/application/login/index.js';
import { uploadRateLimitMiddleware } from './rate_limit.js';
import { apiLogger } from './logger.js';
import type { IAuthRequest } from './data-service/application/auth/index.js';

dotenv.config({ path: '.env.local' });

const app = express();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));
app.use(express.json());
app.use(apiLogger);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || '';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Auth routes
app.post('/api/auth/generate-otp', generateOTPHandler);
app.post('/api/auth/verify-otp', verifyOTPHandler);
app.post('/api/auth/refresh', authenticateJWT, refreshTokenHandler);
app.post('/api/auth/logout', authenticateJWT, logoutHandler);

// Image upload routes
app.post('/api/images/upload', authenticateJWT, uploadRateLimitMiddleware, upload.single('image'), uploadImageHandler);

// Image proxy route - serves images from GCP with proper CORS headers
// Handle OPTIONS preflight request
app.options('/api/images/:userId/:imageId/:filename', cors());

app.get('/api/images/:userId/:imageId/:filename', authenticateJWT, async (req, res) => {
  try {
    const { userId, imageId, filename } = req.params;
    const requestUserId = (req as IAuthRequest).userId;

    console.log('Image proxy: Request received', { 
      urlUserId: userId, 
      tokenUserId: requestUserId,
      imageId,
      filename
    });

    // Just verify JWT is valid (authenticateJWT middleware already did this)
    // Allow any authenticated user to access images
    // In production, you might want stricter checks, but for now we trust the JWT

    // Construct GCP URL
    const gcpUrl = `https://storage.googleapis.com/wall-decor-visualizer-images/${userId}/${imageId}/${filename}`;

    console.log('Image proxy: Fetching from GCP', { gcpUrl });

    // Fetch image from GCP
    const response = await fetch(gcpUrl);

    if (!response.ok) {
      console.error('Image proxy: GCP returned error', { status: response.status, statusText: response.statusText });
      res.status(response.status).json({
        success: false,
        error: {
          message: 'Failed to fetch image from storage',
          code: 'GCP_FETCH_FAILED'
        }
      });
      return;
    }

    // Get content type from GCP response
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Set response headers with CORS
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=3600');

    // Stream the image
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to proxy image',
        code: 'PROXY_ERROR'
      }
    });
  }
});

// BFF (Backend for Frontend) routes
app.get('/api/page/login-page', getLoginPageHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

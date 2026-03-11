// CRITICAL: Load environment variables FIRST before any other imports
// This ensures all modules can access env vars during initialization
console.log('=== SERVER STARTING ===');
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('Environment loaded, MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Now import everything else after env vars are loaded
console.log('Starting imports...');
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import multer from 'multer';
import { generateOTPHandler, verifyOTPHandler, refreshTokenHandler, logoutHandler, authenticateJWT, authenticateAdmin } from './data-service/application/auth/index.js';
import { uploadImageHandler } from './data-service/application/image-upload/index.js';
import { generateModelHandler, getJobStatusHandler, cancelJobHandler, getModelHandler, downloadModelHandler } from './data-service/application/model-generation/index.js';
import { getCatalogModelsHandler, addCatalogModelHandler, updateCatalogModelHandler, deleteCatalogModelHandler } from './data-service/application/catalog/index.js';
import { saveLookHandler, updateLookHandler, getLookHandler, listLooksHandler, deleteLookHandler, getSharedLookHandler, generateShareLinkHandler } from './data-service/application/look-persistence/index.js';
import { getLoginPageHandler } from './page-service/application/login/index.js';
import { uploadRateLimitMiddleware } from './rate_limit.js';
import { apiLogger } from './logger.js';
import type { IAuthRequest } from './data-service/application/auth/index.js';

console.log('All imports loaded successfully');
const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static models folder
const modelsPath = path.join(__dirname, '../../models');
console.log('Serving static models from:', modelsPath);
app.use('/models', express.static(modelsPath, {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

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
app.use(express.json({ limit: '10mb' })); // Increase limit to 10MB for base64 images
app.use(apiLogger);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || '';

console.log('Attempting MongoDB connection...');
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

// Model generation routes
app.post('/api/model/generate', authenticateJWT, generateModelHandler);
app.get('/api/model/job/:jobId', authenticateJWT, getJobStatusHandler);
app.post('/api/model/job/:jobId/cancel', authenticateJWT, cancelJobHandler);
app.get('/api/model/:modelId', authenticateJWT, getModelHandler);
app.get('/api/model/:modelId/download', authenticateJWT, downloadModelHandler);

// Catalog routes
app.get('/api/catalog/models', authenticateJWT, getCatalogModelsHandler);

// Admin catalog routes
app.post('/api/admin/catalog', authenticateJWT, authenticateAdmin, addCatalogModelHandler);
app.put('/api/admin/catalog/:id', authenticateJWT, authenticateAdmin, updateCatalogModelHandler);
app.delete('/api/admin/catalog/:id', authenticateJWT, authenticateAdmin, deleteCatalogModelHandler);

// Look persistence routes
app.post('/api/looks', authenticateJWT, saveLookHandler);
app.put('/api/looks/:id', authenticateJWT, updateLookHandler);
app.get('/api/looks/:id', authenticateJWT, getLookHandler);
app.get('/api/looks', authenticateJWT, listLooksHandler);
app.delete('/api/looks/:id', authenticateJWT, deleteLookHandler);
app.post('/api/looks/:id/share', authenticateJWT, generateShareLinkHandler);
app.get('/api/shared-looks/:shareLink', getSharedLookHandler); // No auth required

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

// Model proxy route - serves 3D models from memory (no GCP needed)
// Handle OPTIONS preflight request
app.options('/api/models/:userId/:filename', cors());

app.get('/api/models/:userId/:filename', async (req, res) => {
  try {
    const { userId, filename } = req.params;
    
    // Get auth token from header OR query parameter (for GLTFLoader compatibility)
    const authHeader = req.headers.authorization;
    const tokenFromQuery = req.query.token as string | undefined;
    
    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (tokenFromQuery) {
      token = tokenFromQuery;
    }
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }
    
    console.log('Model proxy: Request received', { 
      urlUserId: userId,
      filename,
      hasToken: !!token
    });

    // Extract modelId from filename (format: {modelId}.gltf)
    const modelId = filename.replace(/\.(gltf|glb)$/, '');
    
    console.log('Model proxy: Fetching from memory store', { modelId });

    // Import model storage to access in-memory store
    const ModelStorage = await import('./data-service/domain/model-storage/index.js');
    const modelFile = await ModelStorage.getModelFile(modelId);

    if (!modelFile) {
      console.error('Model proxy: Model not found in memory store', { modelId });
      res.status(404).json({
        success: false,
        error: {
          message: 'Model not found',
          code: 'MODEL_NOT_FOUND'
        }
      });
      return;
    }

    console.log('Model proxy: Model found in memory, size:', modelFile.length, 'bytes');
    
    // Log first few bytes to verify it's a valid GLB
    const magic = modelFile.slice(0, 4).toString('ascii');
    console.log('Model proxy: File magic:', magic, '(should be "glTF")');

    // Determine content type based on file extension
    const contentType = filename.endsWith('.glb') ? 'model/gltf-binary' : 'model/gltf+json';

    // Set response headers with CORS
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=3600');

    // Send the model file
    res.send(modelFile);
  } catch (error) {
    console.error('Model proxy error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to proxy model',
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

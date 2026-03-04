import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateOTPHandler, verifyOTPHandler } from './data-service/application/auth/index.js';
import { getLoginPageHandler } from './page-service/application/login/index.js';
import { apiLogger } from './logger.js';

dotenv.config({ path: '.env.local' });

const app = express();

// Middleware
app.use(cors());
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

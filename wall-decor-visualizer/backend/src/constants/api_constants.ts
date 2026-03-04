export const API_CONSTANTS = {
  MAX_IMAGE_SIZE: 10485760, // 10MB
  ACCEPTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  JWT_EXPIRY: 3600, // 1 hour
  JWT_REFRESH_EXPIRY: 604800, // 7 days
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

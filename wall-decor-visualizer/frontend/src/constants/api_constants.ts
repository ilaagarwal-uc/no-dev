export const API_CONSTANTS = {
  MAX_IMAGE_SIZE: parseInt(import.meta.env.VITE_MAX_IMAGE_SIZE || '10485760'),
  ACCEPTED_IMAGE_FORMATS: (import.meta.env.VITE_ACCEPTED_IMAGE_FORMATS || 'jpg,jpeg,png,webp').split(','),
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
  AUTH_USER_KEY: import.meta.env.VITE_AUTH_USER_KEY || 'auth_user'
};

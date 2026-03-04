import { IAuthToken } from './auth_schema';

export const validateLoginResponse = (response: any): boolean => {
  return response.success && !!response.token && !!response.userId;
};

export const isTokenExpired = (expiresAt: number): boolean => {
  return Date.now() > expiresAt;
};

export const storeAuthToken = (token: string, refreshToken: string, expiresIn: number): void => {
  localStorage.setItem(import.meta.env.VITE_AUTH_TOKEN_KEY, token);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('token_expires_at', (Date.now() + expiresIn * 1000).toString());
};

export const getStoredAuthToken = (): string | null => {
  return localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_KEY);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY);
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expires_at');
};

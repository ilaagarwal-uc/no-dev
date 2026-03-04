export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthToken {
  token: string;
  expiresAt: number;
  userId: string;
}

export interface IRefreshToken {
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired' | 'invalid';

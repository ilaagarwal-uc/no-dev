export interface IAuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

export interface IAuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired';

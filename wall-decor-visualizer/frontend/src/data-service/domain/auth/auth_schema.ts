export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export interface IAuthToken {
  token: string;
  expiresAt: number;
  userId: string;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired' | 'invalid';

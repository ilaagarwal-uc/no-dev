export class AuthError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: new AuthError('INVALID_CREDENTIALS', 'Invalid email or password'),
  USER_NOT_FOUND: new AuthError('USER_NOT_FOUND', 'User not found'),
  TOKEN_EXPIRED: new AuthError('TOKEN_EXPIRED', 'Session expired. Please login again'),
  INVALID_TOKEN: new AuthError('INVALID_TOKEN', 'Invalid session token')
};

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: new AuthError('INVALID_CREDENTIALS', 'Invalid email or password', 401),
  USER_NOT_FOUND: new AuthError('USER_NOT_FOUND', 'User not found', 404),
  USER_ALREADY_EXISTS: new AuthError('USER_ALREADY_EXISTS', 'User already exists', 409),
  TOKEN_EXPIRED: new AuthError('TOKEN_EXPIRED', 'Token has expired', 401),
  INVALID_TOKEN: new AuthError('INVALID_TOKEN', 'Invalid token', 401)
};

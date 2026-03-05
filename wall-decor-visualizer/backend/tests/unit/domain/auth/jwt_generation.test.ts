import { describe, it, expect, beforeEach } from 'vitest';
import { generateAuthToken } from '../../../../src/data-service/domain/auth';
import jwt from 'jsonwebtoken';

describe('JWT Token Generation', () => {
  const testUserId = 'user-123';
  
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
    process.env.JWT_EXPIRY = '3600';
  });

  it('should generate valid JWT token with userId', () => {
    const authToken = generateAuthToken(testUserId);
    
    expect(authToken.token).toBeDefined();
    expect(typeof authToken.token).toBe('string');
    expect(authToken.token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should include userId in token payload', () => {
    const authToken = generateAuthToken(testUserId);
    
    const decoded = jwt.verify(
      authToken.token,
      process.env.JWT_SECRET!
    ) as { userId: string };
    
    expect(decoded.userId).toBe(testUserId);
  });

  it('should set expiration time to 1 hour from now', () => {
    const beforeGeneration = Math.floor(Date.now() / 1000);
    const authToken = generateAuthToken(testUserId);
    const afterGeneration = Math.floor(Date.now() / 1000);
    
    const decoded = jwt.verify(
      authToken.token,
      process.env.JWT_SECRET!
    ) as { exp: number; iat: number };
    
    const expectedExpiry = 3600; // 1 hour in seconds
    const actualExpiry = decoded.exp - decoded.iat;
    
    expect(actualExpiry).toBe(expectedExpiry);
    expect(decoded.iat).toBeGreaterThanOrEqual(beforeGeneration);
    expect(decoded.iat).toBeLessThanOrEqual(afterGeneration);
  });

  it('should return expiresAt date approximately 1 hour from now', () => {
    const beforeGeneration = new Date();
    const authToken = generateAuthToken(testUserId);
    const afterGeneration = new Date();
    
    const expectedExpiresAt = new Date(beforeGeneration.getTime() + 3600 * 1000);
    const timeDiff = Math.abs(authToken.expiresAt.getTime() - expectedExpiresAt.getTime());
    
    // Allow 1 second tolerance
    expect(timeDiff).toBeLessThan(1000);
  });

  it('should return userId in auth token object', () => {
    const authToken = generateAuthToken(testUserId);
    
    expect(authToken.userId).toBe(testUserId);
  });
});

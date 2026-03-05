import { describe, it, expect, beforeEach } from 'vitest';
import { generateAuthToken, verifyAuthToken } from '../../../../src/data-service/domain/auth';
import jwt from 'jsonwebtoken';

describe('JWT Token Verification', () => {
  const testUserId = 'user-123';
  
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
    process.env.JWT_EXPIRY = '3600';
  });

  it('should return valid=true for valid token', () => {
    const authToken = generateAuthToken(testUserId);
    const result = verifyAuthToken(authToken.token);
    
    expect(result.valid).toBe(true);
    expect(result.userId).toBe(testUserId);
  });

  it('should return valid=false for expired token', () => {
    const expiredToken = jwt.sign(
      { userId: testUserId },
      process.env.JWT_SECRET!,
      { expiresIn: '-1h' } // Expired 1 hour ago
    );
    
    const result = verifyAuthToken(expiredToken);
    
    expect(result.valid).toBe(false);
    expect(result.userId).toBeUndefined();
  });

  it('should return valid=false for malformed token', () => {
    const result = verifyAuthToken('not.a.token');
    
    expect(result.valid).toBe(false);
    expect(result.userId).toBeUndefined();
  });

  it('should return valid=false for token with invalid signature', () => {
    const tokenWithWrongSecret = jwt.sign(
      { userId: testUserId },
      'wrong-secret',
      { expiresIn: '1h' }
    );
    
    const result = verifyAuthToken(tokenWithWrongSecret);
    
    expect(result.valid).toBe(false);
    expect(result.userId).toBeUndefined();
  });

  it('should return valid=false for empty token', () => {
    const result = verifyAuthToken('');
    
    expect(result.valid).toBe(false);
    expect(result.userId).toBeUndefined();
  });

  it('should extract userId from valid token', () => {
    const authToken = generateAuthToken(testUserId);
    const result = verifyAuthToken(authToken.token);
    
    expect(result.valid).toBe(true);
    expect(result.userId).toBe(testUserId);
  });

  it('should handle token without userId claim', () => {
    const tokenWithoutUserId = jwt.sign(
      { someOtherField: 'value' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    const result = verifyAuthToken(tokenWithoutUserId);
    
    expect(result.valid).toBe(true);
    expect(result.userId).toBeUndefined();
  });
});

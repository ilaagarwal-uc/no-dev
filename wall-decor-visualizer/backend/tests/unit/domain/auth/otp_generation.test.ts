import { describe, it, expect } from 'vitest';
import { generateOTP } from '../../../../src/data-service/domain/auth';

describe('OTP Generation', () => {
  it('should generate fixed OTP "2213" for demo', () => {
    expect(generateOTP()).toBe('2213');
  });

  it('should always return 4-digit string', () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(4);
  });

  it('should return numeric string only', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{4}$/);
  });
});

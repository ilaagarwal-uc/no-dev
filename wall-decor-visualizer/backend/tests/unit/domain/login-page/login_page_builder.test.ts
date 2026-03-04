import { describe, it, expect } from 'vitest';
import { buildLoginPage } from '../../../../src/page-service/domain/login-page/login_page_builder';

describe('Login Page Builder', () => {
  it('should build login page with correct title', () => {
    const page = buildLoginPage();
    expect(page.title).toBe('Wall Decor Visualizer');
  });

  it('should build login page with correct subtitle', () => {
    const page = buildLoginPage();
    expect(page.subtitle).toBe('Sign in to your account');
  });

  it('should include phone number form', () => {
    const page = buildLoginPage();
    expect(page.forms).toHaveLength(2);
    expect(page.forms[0].type).toBe('phone-number-form');
  });

  it('should include OTP form', () => {
    const page = buildLoginPage();
    expect(page.forms).toHaveLength(2);
    expect(page.forms[1].type).toBe('otp-form');
  });

  it('should return valid page structure', () => {
    const page = buildLoginPage();
    expect(page).toHaveProperty('title');
    expect(page).toHaveProperty('subtitle');
    expect(page).toHaveProperty('forms');
    expect(Array.isArray(page.forms)).toBe(true);
  });
});

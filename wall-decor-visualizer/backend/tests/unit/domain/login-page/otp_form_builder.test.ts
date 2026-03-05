import { describe, it, expect } from 'vitest';
import { buildOTPForm } from '../../../../src/page-service/domain/login-page/otp_form_builder';

describe('OTP Form Builder', () => {
  it('should build OTP form with correct type', () => {
    const form = buildOTPForm();
    expect(form.type).toBe('otp-form');
  });

  it('should include OTP input field', () => {
    const form = buildOTPForm();
    expect(form.fields).toHaveLength(1);
    expect(form.fields[0].name).toBe('otp');
    expect(form.fields[0].type).toBe('text');
  });

  it('should have correct field attributes', () => {
    const form = buildOTPForm();
    const field = form.fields[0];
    expect(field.label).toBe('OTP');
    expect(field.placeholder).toBe('Enter 4-digit OTP');
    expect(field.maxLength).toBe(4);
    expect(field.required).toBe(true);
    expect(field.autoFocus).toBe(true);
  });

  it('should include verify and back buttons', () => {
    const form = buildOTPForm();
    expect(form.buttons).toHaveLength(2);
    expect(form.buttons[0].text).toBe('Verify OTP');
    expect(form.buttons[0].type).toBe('submit');
    expect(form.buttons[1].text).toBe('Back');
    expect(form.buttons[1].type).toBe('button');
  });

  it('should return valid form structure', () => {
    const form = buildOTPForm();
    expect(form).toHaveProperty('type');
    expect(form).toHaveProperty('fields');
    expect(form).toHaveProperty('buttons');
    expect(Array.isArray(form.fields)).toBe(true);
    expect(Array.isArray(form.buttons)).toBe(true);
  });
});

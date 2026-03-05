import { describe, it, expect } from 'vitest';
import { buildPhoneNumberForm } from '../../../../src/page-service/domain/login-page/phone_form_builder';

describe('Phone Number Form Builder', () => {
  it('should build phone form with correct type', () => {
    const form = buildPhoneNumberForm();
    expect(form.type).toBe('phone-number-form');
  });

  it('should include phone number input field', () => {
    const form = buildPhoneNumberForm();
    expect(form.fields).toHaveLength(1);
    expect(form.fields[0].name).toBe('phoneNumber');
    expect(form.fields[0].type).toBe('tel');
  });

  it('should have correct field attributes', () => {
    const form = buildPhoneNumberForm();
    const field = form.fields[0];
    expect(field.label).toBe('Phone Number');
    expect(field.placeholder).toBe('Enter your 10-digit phone number');
    expect(field.maxLength).toBe(10);
    expect(field.required).toBe(true);
    expect(field.autoFocus).toBe(true);
  });

  it('should include submit button', () => {
    const form = buildPhoneNumberForm();
    expect(form.buttons).toHaveLength(1);
    expect(form.buttons[0].text).toBe('Send OTP');
    expect(form.buttons[0].type).toBe('submit');
  });

  it('should return valid form structure', () => {
    const form = buildPhoneNumberForm();
    expect(form).toHaveProperty('type');
    expect(form).toHaveProperty('fields');
    expect(form).toHaveProperty('buttons');
    expect(Array.isArray(form.fields)).toBe(true);
    expect(Array.isArray(form.buttons)).toBe(true);
  });
});

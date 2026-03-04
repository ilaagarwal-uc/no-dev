import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { getLoginPageHandler } from '../../../src/page-service/application/login/login_page.api';

const app = express();
app.use(express.json());
app.get('/api/page/login-page', getLoginPageHandler);

describe('GET /api/page/login-page - BFF Endpoint', () => {
  it('should return 200 status code', async () => {
    const response = await request(app).get('/api/page/login-page');
    expect(response.status).toBe(200);
  });

  it('should return success true', async () => {
    const response = await request(app).get('/api/page/login-page');
    expect(response.body.success).toBe(true);
  });

  it('should return page object', async () => {
    const response = await request(app).get('/api/page/login-page');
    expect(response.body).toHaveProperty('page');
    expect(response.body.page).toBeDefined();
  });

  it('should return page with title', async () => {
    const response = await request(app).get('/api/page/login-page');
    expect(response.body.page.title).toBe('Wall Decor Visualizer');
  });

  it('should return page with subtitle', async () => {
    const response = await request(app).get('/api/page/login-page');
    expect(response.body.page.subtitle).toBe('Sign in to your account');
  });

  it('should return page with forms array', async () => {
    const response = await request(app).get('/api/page/login-page');
    expect(Array.isArray(response.body.page.forms)).toBe(true);
    expect(response.body.page.forms.length).toBeGreaterThan(0);
  });

  it('should include phone number form', async () => {
    const response = await request(app).get('/api/page/login-page');
    const phoneForm = response.body.page.forms.find((f: any) => f.type === 'phone-number-form');
    expect(phoneForm).toBeDefined();
    expect(phoneForm.fields).toHaveLength(1);
    expect(phoneForm.fields[0].name).toBe('phoneNumber');
  });

  it('should include OTP form', async () => {
    const response = await request(app).get('/api/page/login-page');
    const otpForm = response.body.page.forms.find((f: any) => f.type === 'otp-form');
    expect(otpForm).toBeDefined();
    expect(otpForm.fields).toHaveLength(1);
    expect(otpForm.fields[0].name).toBe('otp');
  });

  it('should return valid JSON response', async () => {
    const response = await request(app).get('/api/page/login-page');
    expect(response.type).toMatch(/json/);
  });

  it('should have correct content-type header', async () => {
    const response = await request(app).get('/api/page/login-page');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return complete page structure', async () => {
    const response = await request(app).get('/api/page/login-page');
    const page = response.body.page;
    
    expect(page).toHaveProperty('title');
    expect(page).toHaveProperty('subtitle');
    expect(page).toHaveProperty('forms');
    
    page.forms.forEach((form: any) => {
      expect(form).toHaveProperty('type');
      expect(form).toHaveProperty('fields');
      expect(form).toHaveProperty('buttons');
      expect(Array.isArray(form.fields)).toBe(true);
      expect(Array.isArray(form.buttons)).toBe(true);
    });
  });
});
